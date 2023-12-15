// Firebase imports
import express from 'express';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

// dotenv configuration and initialization
dotenv.config();

const router = express.Router();

// Firebase configuration and initialization
const firebaseConfig = {
apiKey: process.env.APIKEY,
authDomain: process.env.AUTHDOMAIN,
projectId: process.env.PROJECTID,
storageBucket: process.env.STORAGEBUCKET,
messagingSenderId: process.env.MESSAGINGSENDERID,
appId: process.env.APPID
}

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

router.get('/session-document', async (req, res) => {
    const sessionId = req.headers['x-session-id'];

    const callDoc = doc(firestore, 'calls', sessionId);
    let sessionDoc = await getDoc(callDoc)
        .then((data)=> { 
            console.log("successfully sent the session doc")
            const offer = data.data();
            res.send(offer)
        })
        .catch((err)=>{ 
            console.log("failed to send the session doc ", err)
            res.sendStatus(500) //failed to add offer
        });
})

router.get('/create-session', async (req, res) => {
        // Create a new session document and setup the sub-collections
        const callDoc = doc(collection(firestore, 'calls'));
        await setDoc(callDoc, {})
            .then(()=>{res.send({ sessionId: callDoc.id })})
            .catch(()=> {res.sendStatus(500)})

})

router.post('/offer', async (req, res) => {
        const sessionId = req.headers['x-session-id'];
        const callDoc = doc(firestore, 'calls', sessionId);
        
        await updateDoc(callDoc, req.body)
            .then(() => {res.sendStatus(200)})
            .catch(() => {res.sendStatus(500)})
})

router.post('/answer', async (req, res) => {
    const sessionId = req.headers['x-session-id'];
    const callDoc = doc(firestore, 'calls', sessionId);
    
    await updateDoc(callDoc, req.body)
        .then(() => {res.sendStatus(200)})
        .catch(() => {res.sendStatus(500)})
})

router.post('/offerCandidates', async (req, res) => {

    const sessionId = req.headers['x-session-id'];

    const callDoc = doc(firestore, 'calls', sessionId);
    const offerCandidates = collection(callDoc, 'offerCandidates');

    await addDoc(offerCandidates, req.body)
        .then(()=> { 
            console.log("successfully added offer candidate to session doc")
            res.sendStatus(200) // successfully added offer
        })
        .catch((err)=>{ 
            console.log("failed to add offer candidate to session doc ", err)
            res.sendStatus(500) //failed to add offer
        });
})

router.get('/offerCandidates', async (req, res) => {
    const sessionId = req.headers['x-session-id'];

    const callDoc = doc(firestore, 'calls', sessionId);
    const offerCandidates = collection(callDoc, 'offerCandidates');

    try {
        const snapshot = await getDocs(offerCandidates);
        let candidates = [];
        snapshot.forEach(doc => {
            candidates.push(doc.data());
        });
        res.json(candidates);
    } catch (error) {
        console.log("Error getting offer candidates: ", error);
        res.status(500).send("Error getting offer candidates");
    }
});

router.post('/answerCandidates', async (req, res) => {

    const sessionId = req.headers['x-session-id'];

    const callDoc = doc(firestore, 'calls', sessionId);
    const answerCandidates = collection(callDoc, 'answerCandidates');

    await addDoc(answerCandidates, req.body)
        .then(()=> { 
            console.log("successfully added answer candidate to session doc")
            res.sendStatus(200) // successfully added offer
        })
        .catch((err)=>{ 
            console.log("failed to add answer candidate to session doc ", err)
            res.sendStatus(500) //failed to add offer
        });
})

router.get('/answerCandidates', async (req, res) => {
    const sessionId = req.headers['x-session-id'];

    const callDoc = doc(firestore, 'calls', sessionId);
    const answerCandidates = collection(callDoc, 'answerCandidates');

    try {
        const snapshot = await getDocs(answerCandidates);
        let candidates = [];
        snapshot.forEach(doc => {
            candidates.push(doc.data());
        });
        res.json(candidates);
    } catch (error) {
        console.log("Error getting answer candidates: ", error);
        res.status(500).send("Error getting answer candidates");
    }
});

router.delete('/delete-document', async (req, res) => {
    const sessionId = req.headers['x-session-id'];
    const callDoc = doc(firestore, 'calls', sessionId);
    await deleteDoc(callDoc)
        .then(() => {res.sendStatus(200)})
        .catch(() => {res.sendStatus(500)})
});

export { router };

