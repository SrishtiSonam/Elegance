$(document).ready(
    
    function(){

        $(".form-group-time-quantum").hide();

        // Show hide RR time quantum
        $('#algorithmSelector').on('change', function(){
            if(this.value === 'optRR') {
                $(".form-group-time-quantum").show(1000);
            } else {
                $(".form-group-time-quantum").hide(1000);
            }
        });


        var processList = [];

        $('#btnAddProcess').on('click', function(){
            var processID = $('#processID');
            var arrivalTime = $('#arrivalTime');
            var burstTime = $('#burstTime');

            if(processID.val() === '' || arrivalTime.val() === '' || burstTime.val() === ''){
                processID.addClass('is-invalid');
                arrivalTime.addClass('is-invalid');
                burstTime.addClass('is-invalid');
                alert("fill process input first")
                return;
            } 
            processID.removeClass('is-invalid');
            arrivalTime.removeClass('is-invalid');
            burstTime.removeClass('is-invalid');

            var process = {
                processID: parseInt(processID.val(), 10),
                arrivalTime: parseInt(arrivalTime.val(), 10),
                burstTime: parseInt(burstTime.val(), 10)
            }

            processList.push(process);
            
            $('#tblProcessList > tbody:last-child').append(
                `<tr>
                    <td id="tdProcessID">${processID.val()}</td>
                    <td id="tdArrivalTime">${arrivalTime.val()}</td>
                    <td id="tdBurstTime">${burstTime.val()}</td>
                </tr>`
            );

            processID.val('');
            arrivalTime.val('');
            burstTime.val('');
        });
        $('#btnCalculate').on('click', function(){

            var table = document.getElementById("tblResults");

            while (table.rows.length > 1) {
            table.deleteRow(1);
            }

            if (processList.length == 0) {
                alert('Please insert some processes');
                return;
            }

            
            var selectedAlgo = $('#algorithmSelector').children('option:selected').val();

            if (selectedAlgo === 'optFCFS') {
                firstComeFirstServed();
            }

            if (selectedAlgo === 'optSJF') {
                shortestJobFirst();
            }

            if (selectedAlgo === 'optSRTF') {
                shortestRemainingTimeFirst();
            }

            if (selectedAlgo === 'optRR') {
                roundRobin();
            }
        });
        
        refresh = function (){
            window.location.reload();
        };
        
        var completedList1 = [];
     
        function firstComeFirstServed(){
            completedList1= [];
          //to sort the process accoring to arrival time
          processList.sort(function (a, b) {
            return a.arrivalTime - b.arrivalTime;
          });
              
            var time = 0;
            var queue = [];
            var completedList = [];
            addToQueue();
            while (processList.length > 0 || queue.length > 0) {
                while (queue.length == 0) {
                    time++;
                    addToQueue();
                }

                // Dequeue from queue and run the process.
                process = queue.shift();
                var prevtime=time
                time+=process.burstTime;

                    completedList1.push({ id:process.processID ,start:prevtime,end:prevtime+process.burstTime});

                addToQueue();  
                process.completedTime = time;
                process.turnAroundTime = process.completedTime - process.arrivalTime;
                process.waitingTime = process.turnAroundTime - process.burstTime;
                completedList.push(process);
            }

            function addToQueue() {
                for(var i = 0; i < processList.length; i++) {
                    if(time >= processList[i].arrivalTime) {
                        var process = {
                            processID: processList[i].processID, 
                            arrivalTime: processList[i].arrivalTime, 
                            burstTime: processList[i].burstTime
                        }
                        processList.splice(i, 1);
                        queue.push(process);
                    }
                }
            }

            // Bind table data
            $.each(completedList, function(key, process){
                $('#tblResults > tbody:last-child').append(
                    `<tr> 
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
                    </tr>`
                );
            });

            // Get average
            var avgTurnaroundTime = 0;
            var avgWaitingTime = 0;
            var maxCompletedTime = 0;

            $.each(completedList, function(key, process){
                if (process.completedTime > maxCompletedTime) {
                    maxCompletedTime = process.completedTime;
                }
                avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
                avgWaitingTime = avgWaitingTime + process.waitingTime;
            });

            $('#avgTurnaroundTime').val( avgTurnaroundTime / completedList.length );
            $('#avgWaitingTime').val( avgWaitingTime / completedList.length );
            $('#throughput').val(completedList.length / maxCompletedTime);

            processList=completedList;
            
    // console.log(completedList1);
    filldata();
        }
        function shortestJobFirst(){

            completedList1= [];
            var completedList = [];
            var time = 0;
            var queue = [];

            while (processList.length>0 || queue.length>0) {
                addToQueue();
                while (queue.length==0) {                
                    time++;
                    addToQueue();
                }
               var process = selectProcess();
               var prevtime=time;
                for (var i = 0; i < process.burstTime; i++) {
                    time++;
                    addToQueue();
                }
                process.processID = process.processID;
                process.arrivalTime = process.arrivalTime;
                process.burstTime = process.burstTime;
                process.completedTime = time;
                process.turnAroundTime = process.completedTime - process.arrivalTime;
                process.waitingTime = process.turnAroundTime - process.burstTime;

                completedList1.push({ id:process.processID ,start:prevtime,end:prevtime+process.burstTime});

                completedList.push(process);
            }
            function addToQueue() {
                for(var i = 0; i < processList.length; i++) {
                    if(processList[i].arrivalTime <= time) {
                        var process = {
                            processID: processList[i].processID, 
                            arrivalTime: processList[i].arrivalTime, 
                            burstTime: processList[i].burstTime
                        }
                        processList.splice(i, 1);
                        i--;
                        queue.push(process);
                    }
                }
            }
            function selectProcess() {
                if (queue.length!=0) {
                    queue.sort(function(a, b){
                        if (a.burstTime > b.burstTime) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });
                }
                var process = queue.shift();
                return process;
            }

            // Bind table data
            $.each(completedList, function(key, process){
                $('#tblResults > tbody:last-child').append(
                    `<tr>
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
                    </tr>`
                );
            });

            // Get average
            var avgTurnaroundTime = 0;
            var avgWaitingTime = 0;
            var maxCompletedTime = 0;
            var throughput = 0;

            $.each(completedList, function(key, process){
                if (process.completedTime > maxCompletedTime) {
                    maxCompletedTime = process.completedTime;
                }
                avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
                avgWaitingTime = avgWaitingTime + process.waitingTime;
            });

            $('#avgTurnaroundTime').val( avgTurnaroundTime / completedList.length );
            $('#avgWaitingTime').val( avgWaitingTime / completedList.length );
            $('#throughput').val(completedList.length / maxCompletedTime);
            processList=completedList;
            filldata();
        }

        function shortestRemainingTimeFirst() {
            completedList1= [];
            var completedList = [];
            var time = 0;
            var queue = [];
            
            while ( processList.length>0 || queue.length>0 ) {
                addToQueue();
                while (queue.length==0) {                
                    time++;
                    addToQueue();
                }
             process = selectProcessForSRTF();
                var prevtime = time;
                // console.log(process);
                // console.log(process.processID,process.burstTime);
                if(process.burstTime<=1)
                {
                    process.completedTime=++time;
                    completedList.push(process);
                    
                completedList1.push({ id:process.processID ,start:prevtime,end:prevtime+process.burstTime});


                }
                else{
                    process.burstTime-=1;
                    time++;
                    queue.push(process);
                    completedList1.push({ id:process.processID ,start:prevtime,end:prevtime+ 1});

                }

            }

            function addToQueue() {
                for(var i = 0; i < processList.length; i++) {
                    if(processList[i].arrivalTime <= time) {
                        var process = {
                            processID: processList[i].processID, 
                            arrivalTime: processList[i].arrivalTime, 
                            burstTime: processList[i].burstTime
                        }
                        processList.splice(i, 1);
                        queue.push(process);
                    }
                }
            }
            function selectProcessForSRTF() {
                if (queue.length != 0) {
                    queue.sort(function(a, b){
                        if (a.burstTime > b.burstTime) {
                            return 1;
                        }
                        else if(a.burstTime==b.burstTime)
                        {
                            return a.processID>b.processID;
                        }
                        else {
                            return -1;
                        }
                    });
                }
                return process = queue.shift();
            }
            function runSRTF() {
                time++;
                addToQueue();
            }

            // Fetch table data
            var TableData = [];
            $('#tblProcessList tr').each(function(row, tr) {
                TableData[row] = {
                    "processID": parseInt($(tr).find('td:eq(0)').text()),
                    "arrivalTime": parseInt($(tr).find('td:eq(1)').text()),
                    "burstTime": parseInt($(tr).find('td:eq(2)').text())
                }
            });

            // Remove header row
            TableData.splice(0, 1);
            
            // Reset burst time
            TableData.forEach(pInTable => {
                completedList.forEach(pInCompleted => {
                    if (pInTable.processID == pInCompleted.processID) {
                        pInCompleted.burstTime = pInTable.burstTime;
                        pInCompleted.turnAroundTime = pInCompleted.completedTime - pInCompleted.arrivalTime;
                        pInCompleted.waitingTime = pInCompleted.turnAroundTime - pInCompleted.burstTime;
                    }
                });
            });

            // Bind table data
            $.each(completedList, function(key, process){
                $('#tblResults > tbody:last-child').append(
                    `<tr>
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
                    </tr>`
                );
            });

            // Get average
            var avgTurnaroundTime = 0;
            var avgWaitingTime = 0;
            var maxCompletedTime = 0;
            var throughput = 0;

            $.each(completedList, function(key, process){
                if (process.completedTime > maxCompletedTime) {
                    maxCompletedTime = process.completedTime;
                }
                avgTurnaroundTime = avgTurnaroundTime + process.turnAroundTime;
                avgWaitingTime = avgWaitingTime + process.waitingTime;
            });

            $('#avgTurnaroundTime').val( avgTurnaroundTime / completedList.length );
            $('#avgWaitingTime').val( avgWaitingTime / completedList.length );
            $('#throughput').val(completedList.length / maxCompletedTime);
            processList=completedList;
            filldata();
        }

        function roundRobin() {
            completedList1= [];

            var timeQuantum = $('#timeQuantum');
            var timeQuantumVal= parseInt(timeQuantum.val(), 10);
            if(timeQuantum.val() ==''){
                alert('Please enter time quantum');
                timeQuantum.addClass('is-invalid');
                return;
            }
            timeQuantum.removeClass('is-invalid');
            var completedList = [];
            var time = 0;
            var queue = [];
            
            while (processList.length > 0 || queue.length > 0) {
                addToQueue();
                while (queue.length == 0) {               
                    time++;
                    addToQueue();
                }
                var prevtime=time;
            process = selectProcessForRR();
               if(process.burstTime<=timeQuantumVal)
               {
                   time+=process.burstTime;
                   process.completedTime=time;
                   completedList.push(process);
                   completedList1.push({ id:process.processID ,start:prevtime,end:prevtime+ process.burstTime});

               }
               else{
                   process.burstTime-=timeQuantumVal
                   time+=timeQuantumVal;
                   addToQueue();
                   queue.push(process);
                   completedList1.push({ id:process.processID ,start:prevtime,end:prevtime+timeQuantumVal});
               }
            }

            function addToQueue() {
                for(var i = 0; i < processList.length; i++) {
                    if(processList[i].arrivalTime <= time) {
                        var process = {
                            processID: processList[i].processID, 
                            arrivalTime: processList[i].arrivalTime, 
                            burstTime: processList[i].burstTime
                        }
                        processList.splice(i, 1);
                        i--;
                        queue.push(process);
                    }
                }
            }
            function selectProcessForRR() {
                if(queue.length==0)
                {
                    return;
                }
                
                return queue.shift();
                                                
                
            }

            // Fetch initial table data
            var TableData = [];
            $('#tblProcessList tr').each(function(row, tr) {
                TableData[row] = {
                    "processID": parseInt($(tr).find('td:eq(0)').text()),
                    "arrivalTime": parseInt($(tr).find('td:eq(1)').text()),
                    "burstTime": parseInt($(tr).find('td:eq(2)').text())
                }
            });

            // Remove table header row
            TableData.splice(0, 1);
            
            // Reset burst time from original input table.
            TableData.forEach(pInTable => {
                completedList.forEach(pInCompleted => {
                    if (pInTable.processID==pInCompleted.processID) {
                        pInCompleted.burstTime= pInTable.burstTime;
                        pInCompleted.turnAroundTime = pInCompleted.completedTime - pInCompleted.arrivalTime;
                        pInCompleted.waitingTime = pInCompleted.turnAroundTime - pInCompleted.burstTime;
                    }
                });
            });

            // Bind table data
            $.each(completedList, function(key, process){
                $('#tblResults > tbody:last-child').append(
                    `<tr>
                        <td id="tdProcessID">${process.processID}</td>
                        <td id="tdArrivalTime">${process.arrivalTime}</td>
                        <td id="tdBurstTime">${process.burstTime}</td>
                        <td id="tdBurstTime">${process.completedTime}</td>
                        <td id="tdBurstTime">${process.waitingTime}</td>
                        <td id="tdBurstTime">${process.turnAroundTime}</td>
                    </tr>`
                );
            });
                
            // Get average
            var totalTurnaroundTime = 0;
            var totalWaitingTime = 0;
            var maxCompletedTime = 0;

            $.each(completedList, function(key, process){
                if (process.completedTime > maxCompletedTime) {
                    maxCompletedTime = process.completedTime;
                }
                // console.log(process.waitingTime);
                totalTurnaroundTime = totalTurnaroundTime + process.turnAroundTime;
                totalWaitingTime = totalWaitingTime + process.waitingTime;
            });
            // console.log(totalWaitingTime,completedList.length);
            // const TAT = document.getElementById('avgTurnaroundTime');
            
            // const waiting_time = document.getElementById('avgWaitingTime');
            
            // const throughput = document.getElementById('throughput');
            
            // TAT.innerHTML= totalTurnaroundTime / completedList.length ;
            
            // waiting_time.innerHTML =totalWaitingTime / completedList.length;
            
            // throughput.innerHTML=completedList.length / maxCompletedTime ;

            $('#avgTurnaroundTime').val( totalTurnaroundTime / completedList.length );
            $('#avgWaitingTime').val( totalWaitingTime / completedList.length);
            $('#throughput').val(completedList.length / maxCompletedTime);
            processList=completedList;
            filldata();
            
        }
        //////////////////////////////////////chart code ////////////////////////////////////////////////////////
        function getDate(sec) {
            return (new Date(0, 0, 0, 0, sec / 60, sec % 60));
        }
        let ganttChartData=[];
        let timelineChartData=[];
        
        function filldata(){
            ganttChartData=[];
            timelineChartData=[];
           var element =  document.getElementById("gantt-chart-heading");
           element.style.display = 'block';  
           var element2 =  document.getElementById("timeline-chart-heading");
           element2.style.display = 'block';  
         
        completedList1.forEach((element)=>{

            ganttChartData.push([
                "Time",
                element.id.toString(),
                "",
                getDate(element.start),
                getDate(element.end)
            ])


        });
        completedList1.forEach((element)=>{

            timelineChartData.push([
                
                element.id.toString(),
                "",
                getDate(element.start),
                getDate(element.end)
            ])


        });
        google.charts.load("current", {packages:["timeline"]});
        google.charts.setOnLoadCallback(drawChart);
        function drawChart() {
          var container = document.getElementById('gantt-chart');
          var chart = new google.visualization.Timeline(container);
          var dataTable = new google.visualization.DataTable();
          
          dataTable.addColumn({ type: "string", id: "Gantt Chart" });
          dataTable.addColumn({ type: "string", id: "Process" });
          dataTable.addColumn({ type: 'string', id: 'style', role: 'style' });
          dataTable.addColumn({ type: 'date', id: 'Start' });
          dataTable.addColumn({ type: 'date', id: 'End' });
        // console.log(ganttChartData);
          dataTable.addRows(ganttChartData);
        //   chart.draw(dataTable);
          
        let timelineWidth = '100%';
        var options = {
            width: timelineWidth,
        };
        chart.draw(dataTable, options);
        }


    // timeline
   
    google.charts.load("current", {packages:["timeline"]});
    google.charts.setOnLoadCallback(drawChart2);
    function drawChart2() {
  
      var container = document.getElementById('example4.2');
      var chart = new google.visualization.Timeline(container);
      var dataTable = new google.visualization.DataTable();
      ;
      dataTable.addColumn({ type: 'string', id: 'id' });
      
      dataTable.addColumn({type: 'string', id: 'style', role: 'style'  })
      dataTable.addColumn({ type: 'date', id: 'Start' });
      dataTable.addColumn({ type: 'date', id: 'End' });
      dataTable.addRows(timelineChartData);
  
      var options = {
        timeline: { colorByRowLabel: true },
        
      };
  
      chart.draw(dataTable, options);
    }


        }


        ////////////////////////////////////////////chart code end//////////////////////////////////////////////////////////////


    }
    
);
