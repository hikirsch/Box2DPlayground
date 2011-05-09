var Site = {
	_NEXT_ENTITY_ID: 0,
	
	Constants: {
		PHYSICS_SCALE: 32,
		BOX_WIDTH: 30,
		BOX_COUNT: 100
	}
};

Site.Init = function() {
	Site.InitStats();

	var tester = new Box2DTester("canvas");
	tester.createBoxes( Site.Constants.BOX_COUNT );
};

Site.InitStats = function() {
	var stats = new Stats();
	document.getElementById("stats").appendChild( stats.domElement );
	setInterval( function () { stats.update(); }, 1000 / 60 );
};

Site.GetNextEntityID = function() {
	Site._NEXT_ENTITY_ID++;
	return Site._NEXT_ENTITY_ID;
};

domReady( Site.Init );