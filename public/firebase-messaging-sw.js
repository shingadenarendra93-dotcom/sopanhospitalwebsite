importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCrh8X94Zm7c6HK8WdnqmBJYC1WhoYb14w",
  authDomain: "sopanhospital-be933.firebaseapp.com",
  projectId: "sopanhospital-be933",
  storageBucket: "sopanhospital-be933.firebasestorage.app",
  messagingSenderId: "739498122034",
  appId: "1:739498122034:web:35f5d0cb3f91b17a37152b"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Background message aala: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
