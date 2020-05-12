var statisticsComponent = {
    events: false,
    projects: [],

    getProjects: function() {
        var that = this;

        //Get all projects
        GetStorage('projects', function(result) {
            that.projects = result.projects || [];
            that.renderSelect(
                '#statistics-field-project', 
                that.projects, 
                'id', 
                'name', 
                'Choose the project to show statistics'
            );
        });
    },

    getStatistics: function(id) {
        if(this.findProject(id) === -1) {
            M.toast({ html: 'Something went wrong.. Project not found', classes: 'toastrError' });
            return;
        }
        var project = this.projects[id];
        
        GetStorage('hours', function(result) {
            if(!result.hours) return;

            var dates = {};
            for(var i = 0; i < result.hours.length; i++) {
                var item = result.hours[i];
                if(item.projectId != id) continue;
                
                if(!dates[ item.day ]) dates[ item.day ] = 0;
                dates[ item.day ] += parseFloat(item.hours);      
            }

            console.log(dates)
        })
    },

    renderSelect: function(target, values, optionProperty, labelProperty, startMessage) {
        var target = $(`${target}`);
        target.html('');
        target.append(`<option value="">${startMessage}</option>`);
        for(var i = 0; i < values.length; i++) {
            var item = values[i];
            target.append(`<option value="${item[optionProperty]}">${item[labelProperty]}</option>`);
        }
        M.AutoInit();
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

        $('#statistics-field-project').change(function() {
            that.getStatistics(parseInt($(this).val()));
        });
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
    }
}