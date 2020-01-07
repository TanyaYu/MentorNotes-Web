const notesList = document.querySelector('#notes-list');

function renderNotes(doc) {
    console.log(`${doc.id} => ${doc.data().description}`);
        
    let root = document.createElement('div');
    let description = document.createElement('p');
    let keywords = document.createElement('div');

    root.setAttribute('data-id', doc.id);
    description.textContent = doc.data().description;

    var keywordsData = doc.data().keywords;
    var i = 0;
    for(i = 0; i < keywordsData.length; i++) {
        let keyword = document.createElement('span');
        keyword.textContent = keywordsData[i];
        keywords.appendChild(keyword);
    }

    root.appendChild(description);
    root.appendChild(keywords);

    notesList.appendChild(root);
}

var db = firebase.firestore();
db.collection('notes').get().then(snapshot => {
    snapshot.docs.forEach(doc => {
        renderNotes(doc);
    });
});