import {initializeApp } from 'firebase/app';
import {getAuth,
    signInWithRedirect,
    signInWithPopup,
    createUserWithEmailAndPassword,
    GoogleAuthProvider ,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    writeBatch,
    query,
    getDocs
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAA57POr9VWLNnPkmr_Yy1aEFBIHK7bKbU",
    authDomain: "crwn-clothing-db-fb6c9.firebaseapp.com",
    projectId: "crwn-clothing-db-fb6c9",
    storageBucket: "crwn-clothing-db-fb6c9.appspot.com",
    messagingSenderId: "482878206108",
    appId: "1:482878206108:web:378bd79fd6c6060293bd59"
  };
  

  const firebaseApp = initializeApp(firebaseConfig);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters(
    {
        prompt:"select_account"
    }
  );

  export const auth = getAuth();
  export const signInWithGooglePopup = ()=> 
    signInWithPopup(auth,googleProvider);
  export const signInWithGoogleRedirect = ()=>
    signInWithRedirect(auth,googleProvider);


  export const db= getFirestore();

  export const addCollectionAndDocuments = async (
    collectionKey,
    objectsToAdd,
    field
    )=>{
    const collectionRef = collection(db,collectionKey);
    const batch = writeBatch(db);

    objectsToAdd.forEach((object)=>{
      const docRef = doc(collectionRef , object.title.toLowerCase());
      batch.set(docRef,object);
      
    });

    
    await batch.commit();
    console.log('done');
  };

  export const getCategoriesAndDocuments = async ()=>{
    const collectionRef = collection(db,'categories');
    const q = query(collectionRef);
    
    const querySnapshot = await getDocs(q);
    const categoryMap = querySnapshot.docs.reduce((acc,docSnapshot)=>{
      const {title, items} = docSnapshot.data();
      acc[title.toLowerCase()]= items;
      return acc;
    },{});
    return categoryMap;

  };


  export const createUserDocumentFromAuth = async(userAuth,additionalInformation)=>{
    if(!userAuth) return;
    const userDocRef = doc(db,'users',userAuth.uid);
    console.log(userDocRef);
    
    const userSnapshot = await getDoc(userDocRef);
    console.log(userSnapshot);
    console.log(userSnapshot.exists());

    if(!userSnapshot.exists()){
        const{displayName,email}=userAuth;
        const createdAt =new Date();

        try{
            await setDoc(userDocRef,{
                displayName,
                email,
                createdAt,
                ...additionalInformation
            });
        }catch(error){
            if(error.code === 'auth/email-already-in-use'){
                alert('Cannot create user ,email already in use');
            }else{
                 console.log('error creating the user',error);
            }
        }
    }
    return userDocRef;
  };

  export const createAuthUserWithEmailAndPassword = async (email,password)=>{
    if(!email || !password) return;

    return await createUserWithEmailAndPassword(auth ,email,password)
  }
  export const signInAuthUserWithEmailAndPassword = async (email,password)=>{
    if(!email || !password) return;

    return await signInWithEmailAndPassword(auth ,email,password)
  }

  export const signOutUser = async ()=>await signOut(auth);
   
export const onAuthStateChangedListener = (callback) =>{
  onAuthStateChanged(auth,callback);
}