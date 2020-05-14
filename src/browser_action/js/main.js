function manageTheme() {
    //Check theme variable 
    GetStorage('theme', function(result) {    
        //Set body with selected theme
        if(!result.theme) {
            result.theme = 'light';
        }
        if(result.theme === 'dark') {
            $('body').addClass('dark');
            $('#switch-theme').text('Switch to light theme');
        }

        //Add event click to manage theme change and save this preference in chrome.storage.local
        $('#switch-theme').click(function(e) {
            var that = $(this);
            e.preventDefault();
            if($('body').hasClass('dark')) {
                chrome.storage.local.set({'theme': 'light'}, function() {
                    $('body').removeClass('dark');
                    that.text('Switch to dark theme');
                });
            } else {
                chrome.storage.local.set({'theme': 'dark'}, function() {
                    $('body').addClass('dark');
                    that.text('Switch to light theme');
                });
            }
        })
    });
}

function managePages() {
    $('#go-to-home').click(function() {
        homeComponent.init();
        $('.page-view').addClass('hide');
        $('#home-container').removeClass('hide');
    });
    $('#go-to-projects').click(function() {
        projectComponent.init();
        $('.page-view').addClass('hide');
        $('#project-container').removeClass('hide');
    });
    $('#go-to-statistics').click(function() {
        statisticsComponent.init();
        $('.page-view').addClass('hide');
        $('#statistics-container').removeClass('hide');
    });
    $('#go-to-import-csv').click(function() {
        importCsvComponent.init();
        $('.page-view').addClass('hide');
        $('#import-csv-container').removeClass('hide');
    });

    //Export hours in CSV
    $('#export-csv, #download-backup').click(function() {
        $('#loading-overlay').fadeIn();
        var rows = [ ["Date", "Project", "Hours", "Description"] ];
        var projects = {};

        GetStorage('projects', function(result) {
            for(var i = 0; i < result.projects.length; i++) {
                var p = result.projects[i];
                projects[ p.id ] = p.name;
            }
            

            GetStorage('hours', function(result) {
                var hours = result.hours || [];
                for(var i = 0; i < hours.length; i++) {
                    var item = hours[i];
                    rows.push([
                        item.day,
                        projects[ item.projectId ],
                        item.hours,
                        item.description
                    ]);
                }

                var csvContent = "data:text/csv;charset=utf-8,";  
                rows.forEach(function(rowArray) {
                    let row = rowArray.join(",");
                    csvContent += row + "\r\n";
                });

                var encodedUri = encodeURI(csvContent);
                var link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "hours-tracker-backup-"+ moment().format('YYYY-MM-DD') +".csv");
                document.body.appendChild(link); 
                link.click();

                SaveStorage('lastBackup', Date.now(), function() {
                    $('#loading-overlay').fadeOut();
                    M.toast({ html: 'Export finished! You can find the file in the downloads section' });
                })
            })
        })
    });
}

//Storage management
function SaveStorage(key, value, callback = function() {}) {
    chrome.storage.local.set({ [key]: value }, callback);
}

function GetStorage(key, callback = function() {}) {
    chrome.storage.local.get([key], callback);
}

$(document).ready(function() {
    //Inizialization materialize
    M.AutoInit();

    $('.sidenav').sidenav();
    $('.modal').modal();
    $('.datepicker').datepicker({
        format: 'yyyy-mm-dd',
        defaultDate: new Date(),
        setDefaultDate: true,
        firstDay: 1
    });

    //Manage switch theme from light to dark
    manageTheme();

    //Manage change view
    managePages();

    //Check time and display backup modal if is necessary 
    GetStorage('lastBackup', function(result) {
        var periodInMs = 15 * 24 * 60 * 60 * 1000;
        GetStorage('hours', function(r) {
            //If there aren't any hours not ask to do backup
            if(!r.hours || r.hours.length === 0) {
                SaveStorage('lastBackup', Date.now());
            } else if(!result.lastBackup || (Date.now() - result.lastBackup) > periodInMs) {
                $('#modal-remember-backup').modal('open')
            }
        });   
    });
})