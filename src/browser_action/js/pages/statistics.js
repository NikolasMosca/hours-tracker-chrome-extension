var statisticsComponent = {
    events: false,
    projects: [],
    theme: 'light',

    getProjects: function() {
        var that = this;

        //Get all projects
        GetStorage('theme', function(result) {  
            if(!result.theme) result.theme = 'light';
            that.theme = result.theme;

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
        });
    },

    getStatistics: function(id) {
        var find = this.findProject(id);
        if(find === -1) {
            M.toast({ html: 'Something went wrong.. Project not found', classes: 'toastrError' });
            return;
        }
        var project = this.projects[find];
        if(!project.price) project.price = 0;
        var that = this;
        
        GetStorage('hours', function(result) {
            if(!result.hours) return;

            var currentYear = moment().format('YYYY')
            var dates = {};
            var money = {};
            var totalHours = 0;
            var totalMoney = 0;

            for(var month = 1; month <= 12; month++) {
                if(month < 10) {
                    dates[`${currentYear}-0${month}`] = 0;
                    money[`${currentYear}-0${month}`] = 0;
                } else {
                    dates[`${currentYear}-${month}`] = 0;
                    money[`${currentYear}-${month}`] = 0;
                }
            }

            for(var i = 0; i < result.hours.length; i++) {
                var item = result.hours[i];
                if(item.projectId != id) continue;

                var year = moment(item.day, 'YYYY-MM-DD').format('YYYY');
                if(year === currentYear) {
                    //Get worked hours 
                    var d = moment(item.day, 'YYYY-MM-DD').format('YYYY-MM');
                    var parsedHours = parseFloat(item.hours); 
                    dates[ d ] += parsedHours;  
                    totalHours += parsedHours;  
                    
                    //Get money earned 
                    money[ d ] += project.price * parsedHours;
                    totalMoney += project.price * parsedHours;  
                } 
            }

            //Calculate actual months worked for a correct average
            var currentMonth = 0;
            for(var m in dates) {
                if(dates[m] > 0) {
                    currentMonth++;
                }
            }

            $('#statistics-list').html(`
                <div class="collection">
                    <a href="#!" class="collection-item">
                        Total hours worked:
                        <span class="new badge" data-badge-caption="">${totalHours}</span>
                    </a>
                    <a href="#!" class="collection-item">
                        Total money earned:
                        <span class="new badge" data-badge-caption="">${totalMoney}</span>
                    </a>
                    <a href="#!" class="collection-item">
                        Average hours per month:
                        <span class="new badge" data-badge-caption="">
                            ${(totalHours > 0 && currentMonth > 0) ? (totalHours / currentMonth) : 0}
                        </span>
                    </a>
                    <a href="#!" class="collection-item">
                        Average money per month:
                        <span class="new badge" data-badge-caption="">
                            ${(totalMoney > 0 && currentMonth > 0) ? (totalMoney / currentMonth) : 0}
                        </span>
                    </a>
                </div>
            `);
            that.renderMonthGraphs(dates);
            that.renderMoneyGraphs(money);
        })
    },

    //Generate the first chart that display worked hours
    renderMonthGraphs: function(data) {
        var labels = Object.keys(data);
        for(var i = 0; i < labels.length; i++) {
            labels[i] = moment(labels[i], 'YYYY-MM').format('MMMM');
        }

        $('#statistics-list').append('<canvas id="month-graphs"></canvas>');
        var ctx = document.getElementById('month-graphs').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Hours worked',
                    data: Object.values(data),
                    backgroundColor: this.theme === 'light' ? '#ee6f73' : '#26a69a',
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    },

    //Generate the second chart that display how much money you earned
    renderMoneyGraphs: function(data) {
        var labels = Object.keys(data);
        for(var i = 0; i < labels.length; i++) {
            labels[i] = moment(labels[i], 'YYYY-MM').format('MMMM');
        }

        $('#statistics-list').append('<canvas id="money-graphs"></canvas>');
        var ctx = document.getElementById('money-graphs').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Money earned',
                    data: Object.values(data),
                    backgroundColor: this.theme === 'light' ? '#ee6f73' : '#26a69a',
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            var label = data.datasets[tooltipItem.datasetIndex].label || '';
                            if (label) label += ': $';
                            label += Math.round(tooltipItem.yLabel * 100) / 100;
                            return label;
                        }
                    }
                }
            }
        });
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