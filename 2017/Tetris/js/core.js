var Tetris = function (){
	this.container = document.getElementById('tetris');
	this.gridW = 10;
	this.gridH = 20;
	this.boardDiv;
	this.board = new Array(this.gridH);
	this.status = 0;//0 stop, 1 start, 2, pause
	this.nextBlock;
	this.activeBlock = [];
	this.bottomRow = this.gridH-1;
	this.timer;
	this.timeout = 0;
	this.timeDelay = 1000;//下落速度
	this.score;
	this.color;

	this.init();
}

Tetris.prototype = {
	init: function(){
		this.initGrid();
		//init board
		for(var i=0; i<this.gridH; i++){
			this.board[i] = new Array(this.gridW);
			for(var j=0; j<this.gridW; j++){
				this.board[i][j] = 0;
			}
		}

		this.control();
	},
	initGrid: function(){
		var html = '<table id="grid" cellpadding="0" cellspacing="0" border="0">';
		for(var i=0; i<this.gridH; i++){
			html += '<tr class="row">'
			for(var j=0; j<this.gridW; j++){
				html += '<td></td>';
			}
			html += '</tr>';
		}

		html += '</table>';
		$(this.container).append(html);
		this.boardDiv = document.getElementById('grid');
	},

	produceObject: function(){
		var random = Math.round(Math.random() * 6);
		var obj = [];
		
		switch(random){
			case 0:{
				//田
				obj = [{x:4,y:0},{x:5,y:0},{x:4,y:1},{x:5,y:1}];
				break;
			}
			case 1:{
				//|___
				obj = [{x:4,y:0}, {x:4,y:1}, {x:5,y:1},{x:6,y:1}];
				break;
			}
			case 2:{
				//__|
				obj = [{x:6,y:0}, {x:4,y:1}, {x:5,y:1}, {x:6,y:1}];
				break;
			}
			case 3:{
				//_____
				obj = [{x:4,y:0},{x:4,y:1},{x:4,y:2},{x:4,y:3}];
				break;
			}
			case 4:{
				//_—
				obj = [{x:5,y:0},{x:6,y:0},{x:4,y:1},{x:5,y:1}];
				break;
			}
			case 5:{
				//—_
				obj = [{x:4,y:0},{x:5,y:0},{x:5,y:1},{x:6,y:1}];
				break;
			}
			case 6:{
				//土
				obj = [{x:5,y:0},{x:4,y:1},{x:5,y:1},{x:6,y:1}];
				break;
			}
			default:{
				alert('生成block失败');
				break;
			}
		}

		this.activeBlock = obj;
	},

	drawBlock: function(){
		//draw
		for(var i=0; i<4; i++){
			this.boardDiv.rows[this.activeBlock[i].y].cells[this.activeBlock[i].x].style.backgroundColor = this.color;
		}
	},
	erase: function(block){
		//clear
		for(var i=0; i<4; i++){
			this.boardDiv.rows[this.activeBlock[i].y].cells[this.activeBlock[i].x].style.backgroundColor = "transparent";
		}
	},

	genColor: function(){
		var ranColor = Math.round(Math.random() * 6);
		var color = '';
		switch(ranColor){
			case 0:{
				color = '#E9662C';
				break;
			}
			case 1:{
				color = '#33ADFF';
				break;
			}
			case 2:{
				color = '#D65AD4';
				break;
			}
			case 3:{
				color = '#FFD700';
				break;
			}
			case 4:{
				color = '#62DCFF';
				break;
			}
			case 5:{
				color = '#E1413D';
				break;
			}
			case 6:{
				color = '#4EB96E';
				break;
			}
			default:{
				color = '#4EB96E';
				break;
			}
		}
		return color;
	},
	control: function(){
		var _this = this;
		//游戏控制
		$(window).on('keydown', function(event){
			if(_this.status == 1){ 
				switch(event.keyCode){
					case 37:{//left
						if(_this.borderTest(-1)){
							_this.erase();
							for(var i=0; i<4; i++){
								_this.activeBlock[i].x--;
							}
							_this.drawBlock();
						}
						break;
					}
					case 38:{//up
						if(_this.borderTest(1)){
							_this.rotate();
						}
						break;
					}
					case 39:{//right
						if(_this.borderTest(1)){
							_this.erase();
							for(var i=0; i<4; i++){
								_this.activeBlock[i].x++;
							}
							_this.drawBlock();
						}
						break;
					}
					case 40:{//down
						if(!_this.collisionDetect()){
							_this.erase();//clear activeblock
							_this.fall();
							_this.drawBlock();
						}
						break;
					}
				}
			}
		});
	},

	startTimer:function(){
		var _this = this;
		
		this.color = this.genColor();
		//生成新的block
		this.produceObject();
		_this.drawBlock();
		
		//下落
		this.timer = setInterval(function(){
			_this.timeout += 1;
			//叠加超出顶部，停止游戏
			if(_this.bottomRow <= 0){
				_this.gameStop();
			}else{
				//block降落到bottom line就停止
				if(_this.collisionDetect() ){
					_this.stopTimer();
				}else{
					_this.erase();
					_this.fall();
					_this.drawBlock();
				}
			}
		}, _this.timeDelay);
	},
	fall: function(){
		for(var i=0; i<4; i++){
			if(this.activeBlock[i].y<this.gridH)
				this.activeBlock[i].y++;
		}
	},

	stopTimer:function(){
		var _this = this;
		this.timer = clearInterval(_this.timer);
		
		var max = this.bottomRow;
		//记录board
		for(var i=0; i<4; i++){
			var row = this.activeBlock[i].y;
			var col = this.activeBlock[i].x;
			this.board[row][col] = 1;
			max = max < row ? max : row;
		}
		this.bottomRow = max;
		//清除已满行
		this.clearFullLine();

		//发放一个新的block
		if(this.status == 1){
			this.startTimer();
		}
	},

	gameStart: function(){
		this.status = 1;
		this.score = 0;	
		//开始计时器
		this.startTimer();
	},

	gameStop: function(){
		this.status = 0;
		this.stopTimer();
		$(this.container).find('#gameStop').text("游戏结束");
	},

	pause: function(){
		this.status = 2;
		this.stopTimer();
		$(this.container).find('#gameStop').text("游戏暂停");
	},

	//if true, collision happens, block stops, timer stop
	collisionDetect: function(){
		var flag = false;
		var _this = this;

		//找到block最底部的高度
		var min = this.activeBlock[3].y;
		for(var i=0; i<4; i++){
			min = min>this.activeBlock[i].y ? min:this.activeBlock[i].y; 
		}

		//flag为true则不可以继续下落了
		if(min+1 >= this.gridH){//下降到底部
			flag = true;
		}else if( !ifClear(this.activeBlock) ){//要降临的位置被占据
			flag = true;
		}
		return flag;

		function ifClear(block){
			//如果下落的地方是空的，返回true
			var flag = true;
			for(var i=0; i<4; i++){
				//console.log(block[i].y+1, block[i].x)
				if(block[i].y < 19 && (_this.board[block[i].y+1][block[i].x] == 1)){
					flag = false;
				}
			}
			return flag;
		}
	},

	//边界检测
	borderTest: function(k){
		var flag = true;
		for(var i=0; i<4; i++){
			//左右的边界检测
			var x = this.activeBlock[i].x;
			var y = this.activeBlock[i].y;
			if(x+k < 0 || x+k >= this.gridW || this.board[y][x+k] == 1) {
				flag = false;
				break;
			}
		}
		return flag;
	},

	rotate: function(){
		var tempBlock = this.copyArray(this.activeBlock);
		var x0 = tempBlock[0].x;
		//计算block中心点
		var cx = Math.round((tempBlock[0].x + tempBlock[1].x + tempBlock[2].x + tempBlock[3].x)/4);
		var cy = Math.round((tempBlock[0].y + tempBlock[1].y + tempBlock[2].y + tempBlock[3].y)/4);
		//根据中心点计算旋转后的坐标
		//旋转的主要算法. 可以这样分解来理解。    
        //先假设围绕源点旋转。然后再加上中心点的坐标。  
		for(var i=0; i<4; i++){
			tempBlock[i].x = cx - cy + this.activeBlock[i].y;
			tempBlock[i].y = cy + cx - this.activeBlock[i].x;
		}

		//检查旋转后是否合法
		for(var i=0; i<4; i++){
			//console.log(tempBlock[i].x, tempBlock[i].y)
			if(!this.ifCellValid(tempBlock[i].x, tempBlock[i].y)){
				return;
			}
		}

		//如果合法，擦除
		this.erase();
		//重新赋值
		for(var i=0; i<4; i++){
			this.activeBlock[i].x = tempBlock[i].x;
			this.activeBlock[i].y = tempBlock[i].y;
		}
		this.drawBlock();
	},

	ifCellValid: function(x,y){/////////////////////////////x,y是反的！！！！
		if(y < 0 || y >= this.gridH || x < 0 || x >= this.gridW){
			return false;
		}else if(this.board[x][y] == 1){
			return false;
		}else{
			return true;
		}
	},

	copyArray: function(arr){
		var arr2 = new Array(4);
		for(var i=0; i<4; i++){
			arr2[i] = {x:0, y:0};
		}
		for(var i=0; i<4; i++){
			arr2[i].x = arr[i].x;
			arr2[i].y = arr[i].y;
		}
		return arr2;
	},

	clearFullLine: function(){
		var fullLine = [];
		for(var j=this.bottomRow; j<this.gridH; j++){
			for(var i=0; i<this.gridW; i++){
				if(this.board[j][i] == 0){
					break;
				}
			}
			if(i == this.gridW){
				fullLine.push(j)
				this.boardDiv.deleteRow(j);
				var line = this.boardDiv.insertRow(0);
				for(var m=0; m<this.gridW; m++){
					line.insertCell(m);
				}
				//update board
				this.board.splice(j, 1);//删除最后一行
				this.board.splice(0, 0, new Array(this.gridW));//添加第一行
				for(var n=0; n<this.gridW; n++){
					this.board[0][n] = 0;
				}
			}
		}

		//update
		this.bottomRow += fullLine.length; 
		this.score += (fullLine.length * 10);
		$('#score').text(this.score);
	}

}

$(function(){
	var tetris = new Tetris(); 

	$('#start').on('click', function(){
		tetris.gameStart();
	});
});
