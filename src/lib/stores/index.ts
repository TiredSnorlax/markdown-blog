import { writable } from "svelte/store";
import { onAuthStateChanged, type Auth, type User } from 'firebase/auth'

// export let currentUser = writable<IUser | null>(null);

export let userStore = (auth: Auth) => {
  let unsubscribe: () => void;

  const user = writable<User | null>(null, (set) => {
    // runs when sub count goes from 0 to 1
    unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("sub firebase auth")
      set(user);
    })

    // returns stop funciton that runs when sub count goes to 0
    return () => unsubscribe();
  });

  return user

}

