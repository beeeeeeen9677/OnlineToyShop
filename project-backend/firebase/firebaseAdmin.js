import admin from "firebase-admin";
import serviceAccount from "../premiumbentoys-firebase-adminsdk-fbsvc-c73296ec2b.json" with { type: 'json' };
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
    