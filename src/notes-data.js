var db = firebase.firestore();
var tempDeletedDoc = null;

export function observe(onAdd, onRemove, onModify) {
    db.collection('notes')
        .orderBy('date_created', "desc")
        .limit(50)
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                console.log(change.type, change.doc.data());
                if (change.type === 'added') {
                    onAdd(change.doc);
                }
                if (change.type === 'removed') {
                    onRemove(change.doc);
                }
                if (change.type === "modified") {
                    onModify(change.doc);
                }
        });
    });
}

export function addNewNote(callback) {
    db.collection('notes').add({
        description: '',
        keywords: [],
        date_created: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then((doc) => {
        callback(doc);
    });;
}

export function deleteNote(id, callback) {
    db.collection('notes').doc(id)
        .get()
        .then(doc => {
            if (doc.exists) {
                db.collection('notes').doc(id).delete();
                tempDeletedDoc = doc;
                callback(doc);
            }
        });
}

export function removeKeyword(id, key) {
    db.collection('notes').doc(id).update({
        keywords: firebase.firestore.FieldValue.arrayRemove(key),
        date_updated: firebase.firestore.FieldValue.serverTimestamp()
    });
}

export function addKeyword(id, key) {
    db.collection('notes').doc(id).update({
        keywords: firebase.firestore.FieldValue.arrayUnion(key),
        date_updated: firebase.firestore.FieldValue.serverTimestamp()
    });
}

export function updateDescription(id, newDescripton) {
    db.collection('notes').doc(id).update({
        description: newDescripton,
        date_updated: firebase.firestore.FieldValue.serverTimestamp()
    });
}

export function undoDelete() {
    if(tempDeletedDoc != null) {
        db.collection("notes").doc(tempDeletedDoc.id).set(tempDeletedDoc.data());
        tempDeletedDoc = null;
    }
}
