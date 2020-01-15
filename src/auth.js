var auth = firebase.auth();
var ui = new firebaseui.auth.AuthUI(auth);

export function startLogin() {
    auth.signOut();
    ui.start('#firebaseui-auth-container', {
        signInOptions: [
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ],
        signInSuccessUrl: '/'
    });
}

export function observeCurrentUser(onUser, onEmpty) {
  auth.onAuthStateChanged(function(user) {
      if (user) {
        onUser(user);
      } else {
        onEmpty();
      }
  });
}

export function getCurrentUserUid() {
    return auth.currentUser.uid;
}

export function logout() {
    auth.signOut();
    window.location.href = "/login.html";
}
