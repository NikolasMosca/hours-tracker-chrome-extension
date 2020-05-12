var projectComponent = {
    events: false,
    projects: [],

    //Get all projects saved
    getProjects: function() { 
        var that = this;
        GetStorage('projects', function(result) {
            that.projects = result.projects || [];

            that.renderList();
        });
    },

    //Check if the project is already inserted 
    checkIfExists: function(projectName) {
        for(var i = 0; i < this.projects.length; i++) {
            if(projectName.toLowerCase() === this.projects[i].name.toLowerCase()) {
                return true;
            }
        }
        return false;
    },

    //Add new project 
    addNewProject: function() {
        var target = $('#project-field-project-name');

        var projectName = target.val();
        if(projectName.length === 0) {
            M.toast({ html: 'It is required a valid project name', classes: 'toastrError' });
            return;
        }
        if(this.checkIfExists(projectName)) {
            M.toast({ 
                html: 'This project already exists! please try with different name', 
                classes: 'toastrError' 
            });
            return;
        }

        this.projects.push({
            id: Date.now(),
            name: projectName,
            price: this.getPrice()
        });
        var that = this;
        SaveStorage('projects', this.projects, function() {
            that.resetInputs();
            that.renderList();
            M.toast({ html: 'Project succesfully added!' });
        });
    },

    //Update project
    updateProject: function(id) {
        var find = this.findProject(id);
        if(find === -1) {
            M.toast({ html: 'Something went wrong.. Project not found', classes: 'toastrError' });
            return;
        }

        this.projects[find].name = $('#project-field-project-name').val();
        this.projects[find].price = this.getPrice();

        var that = this;
        SaveStorage('projects', this.projects, function() {
            $('#project-update-buttons').slideUp().data('id', '');
            $('#project-add-buttons').slideDown();

            that.resetInputs();
            that.renderList();
            M.toast({ html: 'Project succesfully added!' });
        });
    },

    //Remove project 
    removeProject: function(id) {
        var find = this.findProject(id);
        if(find === -1) {
            M.toast({ html: 'Something went wrong.. Project not found', classes: 'toastrError' });
            return;
        }

        var deletedProject = this.projects[find];
        this.projects.splice(find, 1);
        var that = this;
        SaveStorage('projects', this.projects, function() {
            that.renderList();
            M.toast({ html: deletedProject.name + ' deleted!' });
        });
    },

    renderList: function() {
        console.log('renderList', this.projects);

        var target = $('#project-projects-list');
        target.html(`
            <li class="collection-header"><h7>Projects List</h7></li>
            <li class="collection-item">
                <table class="highlight">
                    <tbody></tbody>
                </table>
            </li>
        `);
        
        for(var i = 0; i < this.projects.length; i++) {
            var item = this.projects[i];
            target.find('tbody').append(`
                <tr>
                    <td>
                        <a class="waves-effect waves-light btn">
                            ${item.name}
                        </a> 
                    </td>
                    <td class="mini-column">
                        ${item.price ? (
                            `<span class="new badge" data-badge-caption="">${item.price}</span>`
                        ) : ''}
                    </td>
                    <td class="mini-column">
                        <i class="material-icons pointer project-edit-project" data-id="${item.id}">create</i>
                    </td>
                    <td class="mini-column">
                        <a href="#!" class="secondary-content project-remove-project" data-id="${item.id}">
                            <i class="material-icons">close</i>
                        </a>
                    </td>
                </tr>
            `);
        }
    },

    init: function() {
        this.getProjects();
        if(!this.events) {
            this.events = true;
            this.manageEvents();
        }
    },

    manageEvents: function() {
        var that = this;
        $('#project-field-project-name, #project-field-pay-per-hour').keyup(function(e) {
            if(e.keyCode === 13) {
                if($('#project-add-buttons').is(':visible')) {
                    $('#project-add-new-project').click();
                } else {
                    $('#project-update-project').click();
                }  
            }
        });
        
        $('#project-add-new-project').click(function() {
            that.addNewProject();
        });
        $('#project-update-project').click(function() {
            var id = $('#project-update-buttons').data('id');
            that.updateProject(id);
        });
        $('#project-exit-edit-project').click(function() {
            that.resetInputs();
            $('#project-update-buttons').slideUp().data('id', '');
            $('#project-add-buttons').slideDown();
        });
        
        $(document).on('click', '.project-edit-project', function() {
            that.fillFieldsForEdit($(this).data('id'));
        })
        $(document).on('click', '.project-remove-project', function() {
            that.removeProject($(this).data('id'));
        })
    },

    //Find the project by id, returns the position id it exists, else return -1
    findProject: function(id) {
        var find = -1;
        for(var i = 0; i < this.projects.length; i++) {
            if(id === this.projects[i].id) {
                find = i;
                break;
            }
        }
        return find;
    },

    //Resets inputs 
    resetInputs: function() {
        $('#project-field-project-name').val('');
        $('#project-field-pay-per-hour').val('');
        M.updateTextFields();
    },

    //Fill form for editing the project 
    fillFieldsForEdit: function(id) {
        console.log('fill fields for edit' ,id)
        var find = this.findProject(id);
        if(find === -1) {
            M.toast({ html: 'Something went wrong.. Project not found', classes: 'toastrError' });
            return;
        }
        var editProject = this.projects[find];

        $('#project-field-project-name').val(editProject.name);
        $('#project-field-pay-per-hour').val(editProject.price);

        $('#project-update-buttons').slideDown().data('id', id);
        $('#project-add-buttons').slideUp();

        M.updateTextFields();
    },

    //Get the input price and convert comma in dot 
    getPrice: function() {
        var price = $('#project-field-pay-per-hour').val() || '0'
        return parseFloat(price.split(',').join('.'));
    }
}

projectComponent.init();

