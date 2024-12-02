// See https://kit.svelte.dev/docs/types#app

import type { Session, UnauthenticatedSession } from "$lib/server/SafeSession";
import type { Component } from "svelte";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: Session | UnauthenticatedSession
		}
		interface PageData {
			viewportDisplay?: Component
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
