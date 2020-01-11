import { MDCIconButtonToggle } from '@material/icon-button';
import { MDCChipSet } from '@material/chips';

const noteTemplate = document.getElementById('note-template');
const keyTemplate = document.getElementById('keyword-template');
var callback;

export class NotesAdapter {

    constructor(container, callback_){
        this.container = container;
        this.views = {};
        callback = callback_;
    }

    add(doc) {
        var view = new NoteView(doc.id, doc.data());
        this.views[doc.id] = view;
        this.container.appendChild(view.root);
    }

    remove(doc) {
        var view = this.views[doc.id];
        this.container.removeChild(view.root);
        delete this.views[doc.id];
    }

    update(doc) {
        var view = this.views[doc.id];
        view.update(doc.data());
    }
    
}

class NoteView {

    constructor(id, data) {
        this.root = this.render(id, data);
        this.id = id;
        this.data = data;
    }

    render(id, data) {
        let card = noteTemplate.content.cloneNode(true).querySelector(".note-card");
        this.description = card.querySelector(".note-text");
        let keywordsEl = card.querySelector(".note-keywords-chips");
        this.keywordsEl = keywordsEl;
        let editBtn = new MDCIconButtonToggle(card.querySelector('#edit-button'));
        let deleteBtn = card.querySelector('#delete-button');
        let keywords = new MDCChipSet(keywordsEl);
        this.keywords = keywords;
        
        this.description.textContent = data.description;
    
        var i;
        for(i = 0; i < data.keywords.length; i++) {
            var key = data.keywords[i];
            var chip = this.renderChip(key);
            keywordsEl.appendChild(chip);
            keywords.addChip(chip);
        }
    
        var addChip = this.renderAddChip(id);
        keywordsEl.appendChild(addChip);
    
        keywords.listen('MDCChip:removal', function(e) {
            let key = e.target.querySelector(".mdc-chip__text").textContent;
            callback.onRemoveKeyword(id, key);
        });
    
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            callback.onDeleteNoteClick(id);
        });
    
        return card;
    }

    update(data) {
        var oldData = this.data;
        var newData = data;

        this.updateDescription(newData, oldData);
        this.updateKeywords(newData, oldData);
        
        this.data = data;
    }

    updateDescription(newData, oldData) {
        this.description.textContent = newData.description;
    }

    updateKeywords(newData, oldData) {
        var i;
        for(i = 0; i < newData.keywords.length; i++) {
            var key = newData.keywords[i];
            if(!oldData.keywords.includes(key)) {
                var chip = this.renderChip(key);
                this.keywordsEl.insertBefore(chip, this.keywordsEl.children[i]);
                this.keywords.addChip(chip);
            }
        }
    }

    renderChip(key) {
        let chip = keyTemplate.content.cloneNode(true).querySelector(".mdc-chip");
        let keywordText = chip.querySelector(".mdc-chip__text");
        keywordText.textContent = key;
        return chip;
    }

    renderAddChip(id) {
        let addKeyword = document.createElement('span');
        addKeyword.classList.add('mdc-icon-button', 'material-icons', 'keyword-add');
        addKeyword.role = 'button';
        addKeyword.title = 'Add';
        addKeyword.textContent = 'add_circle';
        addKeyword.addEventListener('click', (e) => {
            callback.onAddKeywordClick(id);
        });
        return addKeyword;
    }
    
}
