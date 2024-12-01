function randomUserID() {
    const n = "0123456789"; // Numbers
    const a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Letters
    const an = a + n; // Both
    const s = "$-_.+!*'()"; // Symbols
    const ans = an + s; // All
    const ns = n + s; // Numbers and symbols
  
    function c(from) { // "character at", shortened for clarity
      return from.charAt(Math.floor(Math.random() * from.length));
    }
  
    return c(an) + c(ans) + c(ns) + c(ans) + c(ns) + c(ans) + c(an); // 7 characters, as per DB format
  }
  
  module.exports = { randomUserID };
  