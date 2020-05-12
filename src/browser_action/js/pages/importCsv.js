var importCsvComponent = {
    events: false, 
    import: [],

    init: function() {
        if(!this.events) {
            this.events = true;
            this.manageEvents();
        }
    },

    //Help to check if exists some value in some property in array of objects
    find: function(array, property, value) {
        for(var i = 0; i < array.length; i++) {
            if(array[i][property] === value) {
                return array[i].id;
            }
        }
        return false;
    },

    createId: function() {
        return Date.now() + (Math.floor(Math.random() * 9999) + 1000);
    },

    formatHours: function(hours) {
        return hours.toString().split(',').join('.');
    },

    importData: function() {
        $('#loading-overlay').fadeIn();

        var projects = [];
        var hours = [];

        for(var i = 1; i < this.import.length; i++) {
            var row = this.import[i].join(",").split(",");

            if(row.length > 1) {
                //Project
                if(!this.find(projects, 'name', row[1])) {
                    projects.push({
                        id: this.createId(),
                        name: row[1]
                    });
                }

                //Hours 
                hours.push({
                    id: this.createId(),
                    projectId: this.find(projects, 'name', row[1]),
                    hours: this.formatHours(row[2]),
                    day: moment(row[0], 'YYYY-MM-DD').format('YYYY-MM-DD'),
                    description: row[3]
                });
            }  
        }

        SaveStorage('projects', projects, function() {
            SaveStorage('hours', hours, function() {
                $('#loading-overlay').fadeOut();
                $("#import-list").html('');
                M.toast({ html: 'Import completed!' });
            })
        })
    },

    displayData: function (results){
        $("#import-list").html('');
        var table = `
            <table id="preview-import" class='highlight import-table'>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Project</th>
                    <th>Hours</th>
                    <th>Description</th>
                </tr>
            </thead>
        `;
        var data = results.data;
        var valid = true;
        
        for(var i = 1; i < data.length; i++){
            table += "<tr>";
            var row = data[i];
            var cells = row.join(",").split(",");

            if(cells.length > 1) {
                for(var j = 0; j < cells.length; j++){
                    table += `<td>`;
                    switch(j) {
                        case 0: //Date 
                            var parseDate = moment(cells[j], 'YYYY-MM-DD').format('DD/MM/YYYY');
                            if(parseDate === "Invalid date") {
                                table += `<strong>${parseDate}</strong>`;
                                valid = false;
                            } else {
                                table += parseDate;
                            }        
                        break;
                        case 2: //Hours 
                            var hours = parseFloat(cells[j]);
                            if(isNaN(hours)) {
                                table += `<strong>${hours}</strong>`;
                                valid = false;
                            } else {
                                table += hours;
                            }
                        break;
                        default: 
                            table += cells[j];
                        break;
                    }  
                    table += `</td>`;
                }
            }  
            table += "</tr>";
        }
        table += "</table>";

        if(valid) {
            table += `
                <div class="input-field col s12 center-align">
                    <a class="waves-effect waves-light btn" id="import-add-hours">
                        <i class="material-icons right">import_export</i>Import hours
                    </a>
                </div>
            `;
        } else {
            table += `
                <div class="input-field col s12 center-align">
                    <a class="waves-effect waves-light btn disabled">
                        <i class="material-icons right">warning</i>Please check your data.. something is wrong
                    </a>
                </div>
            `;
        }
        
        $("#import-list").html(table);
        $('#loading-overlay').fadeOut();
    },

    manageEvents: function() {
        var that = this;

        $('#import-field-csv').change(function() {
            $('#loading-overlay').fadeIn();
            $(this).parse({
                config: {
                    delimiter: "",
                    header: false,
                    complete: function(result) {
                        console.log('success', result)
                        that.import = result.data;
                        that.displayData(result);
                    },
                },
                error: function(err, file) {
                    $('#loading-overlay').fadeOut();
                    M.toast({ html: 'Something went wrong.. ' + err, classes: 'toastrError' });
                },
                complete: function() {
                    M.toast({ html: 'Import completed! Check your data before confirm!' });
                }
            });
        });

        $(document).on('click', '#import-add-hours', function() {
            that.importData();
        })
    },
}