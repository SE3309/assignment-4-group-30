const Database = require('./database/current');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HARD_CODED_DEVELOPMENT_SECRET_DO_NOT_USE_IN_PRODUCTION =
  '5c7d5ca376c201cb8c9963944d6dc7ecfaa305eeafe114e2132f46e1db3f0714154dc00f826a1509a767852f58fb632e5c839484582d70f4893ca61c80e2f902';

// A private symbol to restrict internal construction
const SafeSessionPrivate = Symbol('SafeSession Private Symbol');

// Encapsulates possible errors or error messages
class Fail {
  #error;
  #message;

  constructor(error, message) {
    this.#error = error;
    this.#message = message;
  }

  get error() {
    return this.#error;
  }

  get message() {
    return this.#message;
  }

  static Unauthorized = Symbol('Unauthorized');
  static Nonexistent = Symbol('Nonexistent');
  static Conflict = Symbol('Conflict');
  static DatabaseFault = Symbol('DatabaseFault');
}

function isFail(e) {
  return e instanceof Fail;
}

class UnauthenticatedSession {
  isAuthenticated() {
    return this instanceof Session;
  }

  user(id) {
    return new PossibleUser(SafeSessionPrivate, id);
  }

  async getRealUser(id) {
    if (await Database.userExists(id)) {
      return new User(SafeSessionPrivate, id);
    } else {
      return null;
    }
  }

  async createNewUser(displayName, email, newPassword) {
    if (await Database.userExistsByEmail(email.value)) {
      return new Fail(Fail.Conflict);
    }
    const passwordHash = await bcrypt.hash(newPassword.value, 10);
    const result = await Database.insertNewUser(
      displayName.value,
      email.value,
      passwordHash,
      'GENERIC DEFAULT BIO'
    );
    if (!result) {
      return new Fail(
        Fail.DatabaseFault,
        'Could not insert user to database, another user may exist with the same Email.'
      );
    }
    return new User(SafeSessionPrivate, result);
  }

  async constructJWT(email, password) {
    const authDetails = await Database.getUserAuthDetails(email.value);
    if (!authDetails) {
      return new Fail(Fail.Unauthorized);
    }
    const passwordCorrect = await bcrypt.compare(password.value, authDetails.hash);
    if (!passwordCorrect) {
      return new Fail(Fail.Unauthorized);
    }
    return jwt.sign(
      { id: authDetails.id },
      HARD_CODED_DEVELOPMENT_SECRET_DO_NOT_USE_IN_PRODUCTION,
      { expiresIn: '14d' }
    );
  }
}

class Session extends UnauthenticatedSession {
  #currentUser;

  constructor(symbol, sessionUserID) {
    if (symbol !== SafeSessionPrivate) {
      throw new TypeError('Incorrect symbol. Attempt to construct SafeSession object externally?');
    }
    super();
    this.#currentUser = new CurrentUser(SafeSessionPrivate, sessionUserID);
  }

  static async fromJWT(token) {
    try {
      const decoded = jwt.verify(token, HARD_CODED_DEVELOPMENT_SECRET_DO_NOT_USE_IN_PRODUCTION);
      if (typeof decoded === 'string') {
        return null;
      }
      if (await Database.userExists(decoded.id)) {
        return new Session(SafeSessionPrivate, decoded.id);
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }

  get currentUser() {
    return this.#currentUser;
  }

  async getRealUser(id) {
    if (id === this.#currentUser.id) {
      return this.#currentUser;
    }
    if (await Database.userExists(id)) {
      return new User(SafeSessionPrivate, id);
    } else {
      return null;
    }
  }

  async createNewUser() {
    return new Fail(Fail.Unauthorized, 'Already signed in. Sign out before creating a new user.');
  }

  async getPollInfo(id) {
    const info = await Database.getPollInfoForUser(this.#currentUser.id, id);
    if (info == null) {
      return new Fail(Fail.DatabaseFault);
    }
    const userHasSubmitted = info.submission != null;
    const pollClosed = info.poll.closed;
    if (!pollClosed) {
      info.poll.votes = 'open';
      info.poll.winner = 'open';
    }
    if (!userHasSubmitted && !pollClosed) {
      info.poll.votes = 'inaccessible';
      info.poll.predictions = 'inaccessible';
    }
    return info;
  }

  async getHomepagePollInfos() {
    const [open, closed] = await Promise.all([
      Database.getAllOpenPollsInfoForUser(this.#currentUser.id),
      Database.getLimitedClosedPollsInfoForUser(this.#currentUser.id, 3),
    ]);
    if (open === null || closed === null) {
      return new Fail(Fail.DatabaseFault);
    }
    const infos = [...open, ...closed];
    for (const info of infos) {
      const userHasSubmitted = info.submission != null;
      const pollClosed = info.poll.closed;
      if (!pollClosed) {
        info.poll.votes = 'open';
        info.poll.winner = 'open';
      }
      if (!userHasSubmitted && !pollClosed) {
        info.poll.votes = 'inaccessible';
        info.poll.predictions = 'inaccessible';
      }
    }
    return infos;
  }
}

class PossibleUser {
  #id;

  constructor(symbol, id) {
    if (symbol !== SafeSessionPrivate) {
      throw new TypeError('Incorrect symbol. Attempt to construct SafeSession object externally?');
    }
    this.#id = id;
  }

  get id() {
    return this.#id;
  }

  toString() {
    return this.#id;
  }

  async toRealUser() {
    if (await Database.userExists(this.#id)) {
      return new User(SafeSessionPrivate, this.#id);
    } else {
      return null;
    }
  }
}

class User extends PossibleUser {
  async toRealUser() {
    return this;
  }

  async getInfo() {
    return Database.getUserInfo(this.id);
  }
}

class CurrentUser extends User {}

module.exports = {
  Fail,
  isFail,
  UnauthenticatedSession,
  Session,
  PossibleUser,
  User,
  CurrentUser,
};
