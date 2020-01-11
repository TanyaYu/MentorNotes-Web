import { MDCIconButtonToggle } from '@material/icon-button';
import { MDCChipSet } from '@material/chips';
import { MDCTextField } from '@material/textfield';

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

    get(id) {
        return this.views[id];
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
        this.description = card.querySelector("#note-text-p");
        let keywordsEl = card.querySelector(".note-keywords-chips");
        this.keywordsEl = keywordsEl;
        this.editText = new MDCTextField(card.querySelector('#note-edit-text'));
        let editBtn = new MDCIconButtonToggle(card.querySelector('#edit-button'));
        this.editBtn = editBtn;
        let deleteBtn = card.querySelector('#delete-button');
        let keywords = new MDCChipSet(keywordsEl);
        this.keywords = keywords;
        
        this.description.textContent = data.description;
        this.editText.value = data.description;
        this.toggleDescription('demo');
    
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
            let key = e.detail.chipId;
            callback.onRemoveKeyword(id, key);
        });

        editBtn.listen('MDCIconButtonToggle:change', (e) => {
            if(e.detail.isOn) {
                this.toggleDescription('edit');
            } else {
                this.toggleDescription('demo');
                callback.onDescriptionSaveClick(id, this.editText.value);
            }
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
        if(!this.editMode) {
            this.description.textContent = newData.description;
            this.editText.value = newData.description;
        }
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
        chip.id = key;
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

    toggleDescription(mode) {
        if(mode === "edit") {
            this.editBtn.on = true;
            this.editMode = true;
            this.description.parentElement.style.display = "none";
            this.editText.root_.parentElement.style.display = "block";
            // console.log( this.description.clientHeight);
            // this.editText.root_.querySelector('.mdc-text-field__input').style.height = this.description.clientHeight;
            this.editText.layout();
            this.editText.focus();
        }
        if(mode === "demo") {
            this.editBtn.on = false;
            this.editMode = false;
            this.description.parentElement.style.display = "block";
            this.editText.root_.parentElement.style.display = "none";
        }
    }
    
}
