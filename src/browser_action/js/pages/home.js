var date = new Date();
var currentDay = date.getFullYear() + '-' + 
    ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1) + '-' + 
    ((date.getDate()) < 10 ? '0' : '') + date.getDate();

var homeComponent = {
    events: false,
    listHours: [],
    hours: [],
    projects: [],
    dataList: {},

    //Fields
    fields: {
        project: '',
        hours: '',
        description: '',
        day: currentDay 
    },

    //Get all hours set in the current day
    getDailyHours: function() {
        var that = this;

        //Get all projects
        GetStorage('projects', function(result) {
            that.projects = result.projects || [];
            that.renderSelect(
                '#home-field-project', 
                that.projects, 
                'id', 
                'name', 
                'Choose the project'
            );

            //Get all hours
            GetStorage('hours', function(result) {
                that.hours = result.hours || [];
                that.generateList();
            });
        });
    },

    generateList: function() {
        var days = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
            'Thursday', 'Friday', 'Saturday'
        ];
        var months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        var objProjects = {};
        for(var i = 0; i < this.projects.length; i++) {
            objProjects[ this.projects[i].id ] = this.projects[i].name;
        }

        var objHours = {};
        for(var i = 0; i < this.hours.length; i++) {
            var h = { ...this.hours[i] };
            if(!objHours[ h.day ]) {
                objHours[ h.day ] = [];
            }
            var d = new Date(h.day);
            h.dayName = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
            h.project = objProjects[ h.projectId ];
            objHours[ h.day ].push(h);
        }
        
        this.dataList = objHours;

        this.renderList();
    },

    //Add hours in the current day
    addDailyHours: function() {
        if(this.fields.project.length === 0) {
            M.toast({ html: 'Project is a required field', classes: 'toastrError' });
            return;
        }
        if(this.fields.hours.length === 0) {
            M.toast({ html: 'Hours is a required field', classes: 'toastrError' });
            return;
        }
        if(this.fields.day.length === 0) {
            M.toast({ html: 'Day is a required field', classes: 'toastrError' });
            return;
        }

        this.hours.push({
            id: Date.now(),
            projectId: this.fields.project,
            hours: this.fields.hours,
            description: this.fields.description,
            day: this.fields.day
        });
        var that = this;
        SaveStorage('hours', this.hours, function() {
            M.toast({ html: 'Hours succesfully added!'});
            that.resetInputs();
            that.generateList();
        });
    },

    //Remove hours 
    removeHours: function(id) {
        var find = -1;
        for(var i = 0; i < this.hours.length; i++) {
            if(id === this.hours[i].id) {
                find = i;
                break;
            }
        }

        if(find !== -1) {
            this.hours.splice(find, 1);
            var that = this;
            SaveStorage('hours', this.hours, function() {
                M.toast({ html: 'hours deleted!' });
                that.getDailyHours();   
                that.generateList();
            });
        } else {
            M.toast({ html: 'Something went wrong.. Hours not found', classes: 'toastrError' });
        }
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

    //Calculate total hours from a single day
    getTotalHours: function(items) {
        var total = 0;
        for(var j = 0; j < items.length; j++) {
            total += parseFloat(items[j].hours);
        }
        return total;
    },

    renderList: function() {
        var target = $('#home-hours-list');
        target.html('');

        //Order list 
        var dates = Object.keys(this.dataList);
        dates.sort(function(a, b){ return new Date(b).getTime() - new Date(a).getTime() });

        var maxList = 30;
        if(dates.length < maxList) maxList = dates.length;
        
        for(var i = 0; i < maxList; i++) {
            var date = dates[i];
            var item = this.dataList[date];

            target.append(`
                <li class="collection-header">
                    <h7>${item[0].dayName}</h7>
                    <span class="new badge" data-badge-caption="hours">${this.getTotalHours(item)}</span>
                </li>
                <li class="collection-item" >
                    <table class="highlight">
                        <tbody data-day="${date}"></tbody>
                    </table>
                </li>
            `);

            for(var j = 0; j < item.length; j++) {
                var hour = item[j];
                target.find(`[data-day="${date}"]`).append(`
                    <tr>
                        <td>
                            <a 
                                class="waves-effect waves-light btn ${hour.description ? 'tooltipped' : ''}" 
                                ${hour.description ? (
                                    `
                                    data-position="top" 
                                    data-tooltip="${hour.description}"
                                    `
                                ): ''}
                            >
                                ${hour.project}
                            </a> 
                        </td>
                        <td class="mini-column">
                            <span class="new badge" data-badge-caption="hours">${hour.hours}</span>
                        </td>
                        <td class="mini-column">
                            <a href="#!" class="secondary-content home-remove-hours" data-id="${hour.id}">
                                <i class="material-icons">close</i>
                            </a>
                        </td>
                    </tr>
                `);
            }
        }

        $('.tooltipped').tooltip();
    },

    init: function() {
        //Fill options in hours field
        var listHours = [];
        for(var hours = 0.5; hours <= 12; hours += 0.5) {
            listHours.push({
                value: hours,
                label: hours + ' Hours'
            });
        }
        this.listHours = listHours;
        this.renderSelect(
            '#home-field-hours', 
            this.listHours, 
            'value', 
            'label', 
            'Choose how much hours you have worked'
        );

        this.getDailyHours();   

        if(!this.events) {
            this.events = true;
            this.manageEvents();
        }
    },

    manageEvents: function() {
        var that = this;
        $('#home-field-project').change(function() {
            that.fields.project = $(this).val();
        });
        $('#home-field-hours').change(function() {
            that.fields.hours = $(this).val();
        });
        $('#home-field-day').change(function() {
            that.fields.day = $(this).val();
        });
        $('#home-field-description').change(function() {
            that.fields.description = $(this).val();
        }).keyup(function(e) {
            if(e.keyCode === 13) {
                $('#home-add-hours').click();
            }
        });
        $('#home-add-hours').click(function() {
            that.addDailyHours();
        });
        $(document).on('click', '.home-remove-hours', function() {
            that.removeHours($(this).data('id'));
        })
    },

    //Resets inputs 
    resetInputs: function() {
        $('#home-field-project').val('');
        $('#home-field-hours').val('');
        $('#home-field-description').val('');
        M.updateTextFields();
        $('select').formSelect();
    },

}

homeComponent.init();