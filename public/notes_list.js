const notesList = document.querySelector('#notes-list');

function renderNotes(doc){
    console.log(`${doc.id} => ${doc.data().description}`);
        
    let root = document.createElement('div');
    let keyword = document.createElement('p');
    let description = document.createElement('p');

    root.setAttribute('data-id', doc.id);
    keyword.textContent = doc.data().keywords[0];
    description.textContent = doc.data().description;

    root.appendChild(keyword);
    root.appendChild(description);

    notesList.appendChild(root);
}

var db = firebase.firestore();
db.collection('notes').get().then(snapshot => {
    snapshot.docs.forEach(doc => {
        renderNotes(doc);
    });
});