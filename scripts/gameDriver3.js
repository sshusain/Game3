//bools
var simpleGame, roundOn;

//integers
var numCards, gameSpeed, roundsLeft, p1score, numGraphs, curCard, swapsLeft, correctCard, answeredCard, numRounds;

//arrays
var graphTypes, graphChosen, cardList, masterParms, distCard;

var distributions, intervalKey;

//jquery calls
$(document).ready(function() {
	
	$('#startup-modal').modal('show');
    
	//printer button
	$('#printResultsButton').click(function() { window.print(); });
	
	$('#startup-modal').on('hidden.bs.modal', function (e) {
		boardSetup();
	});
	$(document).on('mouseenter', ".boardcard", function() 
	{ 
		cardList[Number(this.id.substring(4,this.id.length))].highlight();
	}); 
	$(document).on('mouseleave', ".boardcard", function() 
	{ 
		cardList[Number(this.id.substring(4,this.id.length))].unhighlight();
	}); 
	$(document).on('click', ".boardcard", function() 
	{ 
		if(roundOn)
		{
			answeredCard=Number(this.id.substring(4,this.id.length));
			console.log(answeredCard);
			endRound();
		}
	}); 
});

//sets up board for a new game
function boardSetup()
{
	numCards=Number($('input[name="numcards"]:checked').val());
	gameSpeed=Number($('input[name="gamespeed"]:checked').val());
	roundsLeft=Number($('input[name="gamelength"]:checked').val());
	cardList=new Array();
	masterParms=new Array();
	numRounds=roundsLeft;
	for(var j=0;j<31;j++)
	{
		masterParms[j]=getParms(j+1);
	} 
	
	//checks for simplified or general veresion
	if($('input[name="gametype"]:checked').val()==1)
		simpleGame=false;
	else
		simpleGame=true;
	
	//determines list of selectable graphs
	if(simpleGame)
		numGraphs=22;
	else
		numGraphs=31;
	
	p1score=0;
	
	for(var j=0;j<numCards;j++)
	{
		cardList[j]=new monteClass(j);
	}
	
	//wipes instructions and creates board	
	setBoard();
/* 	$("#scores").html('P1 Score: <b>'+p1score+'</b> P2 Score: <b>'+p2score+'</b><br>P1 Combo Multiplier: <b>x'+p1bonus+'</b> P2 Combo Multiplier: <b>x'+p2bonus+"</b>"); */
	
	window.setTimeout(function(){startRound()},2000);
}

//starts next round
function startRound()
{
	getGraphs();
	distCard=new Array()
	curCard=0;
	
	//shows identity of each card, then hides again
	for(var j=0;j<numCards;j++)
	{
		$("#card"+j).flip({
			direction:'tb',
			onEnd:function()
			{
				$("#card"+curCard).hide();
				$("#space"+curCard).append('<canvas id="distcanv'+curCard+'"></canvas>');
				$("#distcanv"+curCard).css({"width":"190","background-color":"white","height":"90"});
				cardList[curCard].setDist(graphTypes[curCard]+1,curCard, masterParms);
				curCard++;
			}
		})
		window.setTimeout(function(){
			$("#distcanv"+(curCard-numCards)).flip({
				direction:'tb',
				onEnd:function()
				{
					$("#card"+(curCard-numCards-numCards)).show();
					$("#distcanv"+(curCard-numCards-numCards)).remove();
					curCard++;
				}
			})
			curCard++;
		},2000);
	}
	swapsLeft=5;
 	window.setTimeout(function(){
		intervalKey=window.setInterval(function(){
		
		//select cards to be swapped
		var c1=Math.floor(Math.random()*numCards);
		var c2;
		
		//check to make sure 2 different cards are selected
		do{c2=Math.floor(Math.random()*numCards)}while(c2==c1)
		
		//sort cards in ascending order
		if(c1>c2)
		{
			var tempc=c1;
			c1=c2;
			c2=tempc
		}
		
		//swap cards
		swapCards("#space"+c1,"#space"+c2,(c1*(190+40)),(c2*(190+40)));
		},1000/gameSpeed+320);
	},3200); 
	
	
	roundOn=true;
}

//ends current round
function endRound()
{
	roundsLeft--;
	roundOn=false;
	smartTime=0;
	
	//compares selected card to actual card
	if(answeredCard==correctCard)
	{
		p1score++;
		$("#facecard").flip({
			direction:"tb", 
			color:"rgb(50,200,60)", 
			content:"Correct!"
		})
	}
	
	else
	{
		$("#facecard").flip({
			direction:"tb", 
			color:"red", 
			content:"Incorrect! Too Bad!"
		})
	}
	
	//checks to see if game is over
	if(roundsLeft>0)
	{
		window.setTimeout(function(){startRound()},1500);
	}
	
	//endgame sequence
	else
	{
		window.setTimeout(function()
		{
			$("#game").empty();
			$("#yourscore").html(p1score);
			if(p1score<numRounds/2)
				$("#finalmess").html("<b>You need more practice!</b>");
			else if(p1score<numRounds)
				$("#finalmess").html("<b>Great Job! Try to get a perfect score next time!</b>");
			else
				$("#finalmess").html("<b>Wow! Perfect Score!</b>");
			$('#results-modal').modal('show');
			
		},1000);
	}
}

//creates gameboard using recieved parameters;
function setBoard()
{
	$("#facecard").html("Let's play a game!");
	$("#facecard").css({"position":"relative","top":"350px","height":"200px","width":"1000px", "background-color":"rgb(50,200,60)", "text-align":"center", "line-height":"200px", "font-family":"Verdana","font-size":"2.5em", "color":"white"})
	$("#board").css({"position":"relative", "top":"110px","width":((190*(numCards)+50*(numCards-1))+"px"),"z-index":"0","height":(110)+"px","background-color":"rgb(255, 255, 255)"});
	for(var j=0;j<numCards;j++)
	{
		cardList[j].placeCard();
	}
}

//obtains random graph types for each card on board
function getGraphs()
{
	graphTypes=new Array();
	graphChosen=new Array();
	for(var j=0;j<numGraphs;j++)
	{
		graphChosen[j]=false;
	}
	for(var j=0;j<numCards;j++)
	{
		var k;
		
		do
		{
			k=Math.floor(Math.random()*numGraphs);
		}while (graphChosen[k]);
		graphChosen[k]=true;
		graphTypes[j]=k;
	}
}

//function to animate any HTML object in an elliptical path
//total time:1000/speed
function animateAround(name,radius,startX, startY, dir, theta, speed)
{
	theta+=.01;
	var nextX=(Math.cos(theta*Math.PI+Math.PI)+1)*radius*dir+startX;
	var nextY=(-1)*Math.sin(theta*Math.PI+Math.PI)*100*dir+startY;
	$(name).css({"left":nextX+"px"});
	$(name).css({"top":nextY+"px"});
	if(theta<1)
	{
		window.setTimeout(function(){animateAround(name, radius, startX, startY, dir, theta, speed)}, 10/speed)
	}
}

//function to swap 2 cards, and prompt for choice
function swapCards(card1, card2, card1x, card2x)
{console.log(card1+" "+card2);
	animateAround(card1, (card2x-card1x)/2, card1x, 210, 1, 0,gameSpeed)
	animateAround(card2, (card2x-card1x)/2, card2x, 210, -1, 0,gameSpeed)
	swapsLeft--;
	if(swapsLeft<1)
	{console.log("flip done")
		window.clearInterval(intervalKey)
		correctCard=Math.floor(Math.random()*numCards);
		roundOn=true;
		$("#facecard").flip({
			direction:"tb", 
			color:"#008B8B", 
			content:("Select the "+(cardList[correctCard].dist.getDist())+" distribution")
		})
		console.log("Correct card: "+correctCard);
	}
	window.setTimeout(function(){console.log("namechange!!!!!!!!!!!!"+card1+" "+card2);
		var temp=card1;
		var temp2=card2;
		$(card1).attr('id',"temp")
		$(card2).attr('id',card1.substring(1))
		$("#temp").attr('id',card2.substring(1)) 
	},1000/gameSpeed+220)
}
