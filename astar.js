$(document).ready(function(){
    // alert("Create a maze for the computer to navigate through! 👁️ \nclick on start to begin the mazerunner 👣. \npress full reset when you want to reset the game 🔄\npress reset path if you want to edit your made maze 👨🏼‍💻"); 
    var maze = [];
    var blocked = 0;
    
    var temporEnd;
    var openList = [];

    var closedList = [];
    
    var nodeId = 0;
    var start, stop;
    
    $("td").on("click",function(){
        //if this doesn't contain start or stop
        if($(this).hasClass("Road")){
            $(this).addClass("Wall");
            $(this).removeClass("Road");
        }
    });
    
    $("td").on("dblclick", function(){
        //if this doesnt contain start or stop
        if($(this).hasClass("Wall")){
            $(this).addClass("Road");
            $(this).removeClass("Wall");
        }
    });
    
    
    function showPath(node){
        $('td').each(function(){
            if($(this).parent().children().index($(this)) == node.xCo && $(this).parent().parent().children().index($(this).parent()) == node.yCo && $(this).hasClass("Road")){
                $(this).removeClass("Road");
                $(this).addClass("Path");
            }
        })
        if(node.parentID !== 0){
            for(var o = 0; o < closedList.length; o++){
                if(closedList[o].id == node.parentID){
                    showPath(closedList[o]);
                }
            }
        }
    }
    
    $("#btnStart").on("click", function(){
        //disable cell clicking
        $("td").off("click");
        $("td").off("dblclick");
        
        //check for coordinates of the cell and get the class (road,wall, begin, end)
        $('td').each(function(){
        // !!!! very useful when showing path!
        var colIndex = $(this).parent().children().index($(this));
        var rowIndex = $(this).parent().parent().children().index($(this).parent());
        //check for existence of inner array
        if(!maze[rowIndex]){
            maze[rowIndex] = [];
        }
        //put cssClass of cell inside of array
        maze[rowIndex][colIndex] = $(this).attr("class");
    });
        astar();
        if(blocked === 0){
            showPath(closedList[closedList.length-1]);
        }   
        
        //reset some variables
        closedList = [];
        openList = [];
        temporEnd = undefined;
        nodeId = 0;
    });
    
    
    $("#btnReset").on("click", function(){
        
        $("td").on("click", function(){
            //make into wall if this doesnt contain start or stop
            if($(this).hasClass("Road")){
                $(this).addClass("Wall");
                $(this).removeClass("Road");
                }
        });
        $("td").on("dblclick", function(){
            //make into road if this doesnt contain start or stop
            if($(this).hasClass("Wall")){
                $(this).addClass("Road");
                $(this).removeClass("Wall");
            }
        });
        //turn walls and paths into roads
        $("td").each(function(){
            if($(this).hasClass("Wall")||$(this).hasClass("Path")){
            $(this).removeClass("Wall");
            $(this).removeClass("Path");
            $(this).addClass("Road");
            }
        });
    });
    
    $("#btnPathreset").on("click", function(){
        $("td")
            .on("click", function(){
            //make into wall if this doesnt contain start or stop
            if($(this).hasClass("Road")){
                $(this).addClass("Wall");
                $(this).removeClass("Road");
            }
        })
            .on("dblclick", function(){
                //make into road if this doesnt contain start or stop
                if($(this).hasClass("Wall")){
                    $(this).addClass("Road");
                    $(this).removeClass("Wall");
                }
            })
            //turn paths into roads
            .each(function(){
                if($(this).hasClass("Path")){
                    $(this).removeClass("Path");
                    $(this).addClass("Road");
                }
            });
    });
    
//----------------------------------------ALGORITHM-------------------------------------------------------------------------
    //gets the parent of the parent
    function parentParent(id){
        for(var o = 0; o < openList.length; o++){
            if(openList[o].id == id){
                return openList[o].parentID;
            }
        }
        for(var c = 0; c < closedList.length; c++){
            if(closedList[c].id == id){
                return closedList[c].parentID;
            }
        }
    }
    
    //calculate distance from node to stop using the manhatten method
    function gScore(y,x){
        var resulty, resultx;
        if(y<= stop.yCo){
            resulty = stop.yCo - y;
        }
        else{
            resulty = y - stop.yCo;
        }
        
        if(x <= stop.xCo){
            resultx = stop.xCo - x;
        }
        else{
            resultx = x - stop.xCo;
        }
        
        return resulty + resultx;
    }
    
    
    //calculate distance from start to node using the existing path
    function hScore(parent){
    var newParent;
        if(parent === 0){
            return 1;
        }
        else{
            newParent = parentParent(parent);
            return 1 + (hScore(newParent));
        }
    }
    
    
    
    //object for every node
    function Node(id, yCo, xCo, parentID){
        this.id = id;
        this.yCo = yCo;
        this.xCo = xCo;
        this.parentID = parentID;
        this.hValue = hScore(parentID);
        this.gValue = gScore(yCo, xCo);
        this.fValue = this.hValue + this.gValue;
    }
    
    //check open and closed list so there are no duplicates inside the lists
    function checkLists(y,x){
        for(var c = 0; c < openList.length; c++){
            if(openList[c].yCo == y && openList[c].xCo == x){
                return '1';
            }
            else{
                for(var o = 0; o < closedList.length; o++){
                    if(closedList[o].yCo == y && closedList[o].xCo == x){
                         return 1;
                    }
                }
            }
        }
        return 0;
    }
    
    function astar(){
    //go through array to find start position
        for(var y = 0; y < maze.length; y++){
            for(var x = 0; x < maze[y].length; x++){
                if(maze[y][x] == "Start"){
                    start = {id:nodeId,yCo:y, xCo:x, parentID:0};
                    nodeId++;
                }
                if(maze[y][x] == "Stop"){
                    stop = {yCo:y, xCo:x};
                }
            }
        }
        start.hValue = 0;
        start.gValue = gScore(start.yCo, start.xCo);
        start.fValue = start.hValue + start.gValue;
        //to find the way until end
        temporEnd = start;
        search:
        while(temporEnd != stop){
            var taken;
            var newYCo, newXCo;
            //check if the temporary end is next to any borders of the grid for making new childnodes
            if(temporEnd.yCo > 0){
                newYCo = temporEnd.yCo-1;
                taken = checkLists(newYCo, temporEnd.xCo);
                if(taken === 0){
                    if(maze[newYCo][temporEnd.xCo] != "Wall"){
                        openList.push(new Node(nodeId,newYCo, temporEnd.xCo, temporEnd.id));
                        nodeId++;
                    }
                }
            }
            if(temporEnd.yCo < 8){
                newYCo = temporEnd.yCo+1;
                taken = checkLists(newYCo, temporEnd.xCo);
                if(taken === 0){
                    if(maze[newYCo][temporEnd.xCo] != "Wall"){
                        openList.push(new Node(nodeId, newYCo, temporEnd.xCo, temporEnd.id));
                        nodeId++;
                    }
                }
            }
            if(temporEnd.xCo > 0){
                newXCo = temporEnd.xCo-1;
                taken = checkLists(temporEnd.yCo, newXCo);
                if(taken === 0){
                    if(maze[temporEnd.yCo][newXCo] != "Wall"){
                        openList.push(new Node(nodeId,temporEnd.yCo, newXCo, temporEnd.id));
                        nodeId++
                    }
                }
            }
            if(temporEnd.xCo < 8){
                newXCo = temporEnd.xCo+1;
                taken = checkLists(temporEnd.yCo, newXCo);
                if(taken === 0){
                    if(maze[temporEnd.yCo][newXCo] != "Wall"){
                        openList.push(new Node(nodeId,temporEnd.yCo, newXCo, temporEnd.id));
                        nodeId++;
                    }
                }
            }
            
            //put temporary end into closed list and delete from open list
            closedList.push(temporEnd);
            var openIndex = openList.indexOf(temporEnd);
            if(openIndex > -1){
                openList.splice(openIndex,1);
            }
            temporEnd = openList[0];
            if(openList.length == 0){
                alert("Every reachable node has been discovered \nThere is no way to the END of the maze.");
                blocked = 1;
                break search;
            }
            else{
                blocked = 0;
            }
            //check all openList Elements if one of them is the stop node
            for(var counter = 0; counter < openList.length; counter++){
                if(openList[counter].xCo == stop.xCo && openList[counter].yCo == stop.yCo){
                    temporEnd = stop;
                    alert("Path has been found! ")
                }
                //else check for F-value
                else{
                    if(openList[counter].fValue <= temporEnd.fValue){
                        if(openList[counter].fvalue == temporEnd.fValue){
                            if(openList[counter].gValue < temporEnd.gValue){
                                temporEnd = openList[counter];
                            }
                            else{
                                if(openList[counter].xCo == temporEnd.xCo){
                                    if(openList[counter].yCo > temporEnd.yCo){
                                        temporEnd = openList[counter];
                                    }
                                }
                                if(openList[counter].yCo == temporEnd.yCo){
                                    if(openList[counter].xCo > temporEnd.xCo){
                                        temporEnd = openList[counter];
                                    }
                                }
                            }
                        }
                        else{
                            temporEnd = openList[counter];
                        }
                    }
                }
            }
        }
        
        /* put start into temporEnd
                *get childnodes --x ++x --y ++y (no walls)( >= 0)( <= 8)(nodes not in open or closed list)
                *put childNodes inside openList with values (ID, x-coor, y-coor, parent(ID), F-value(G-value + H-value)
                    ***F = total || G = start to Node with the already chosen path || H = Node to Stop
                *put start into ClosedList
                *put childnode with lowest F-score( --> lowest H-score --> lowest x- and y-coord) into temporEnd
                    *get childnodes ...
                    *etc.
                    *Stop when childNode = Stop --> Retrace path by taking parent of Node in Closed until Start
        */
    }
});