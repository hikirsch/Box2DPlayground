var DemoBox2D = {
	Constants: {
		GAME_HEIGHT: 600,
		GAME_WIDTH: 800,
		PHYSICS_SCALE: 32
	}
};

var Site = {};

Site.InitStats= function() {
	var stats = new Stats();

	document.getElementById("stats").appendChild( stats.domElement );

	setInterval( function () { stats.update(); }, 1000 / 60 );
};

Site.Loop = function() {
	if( Site.Box2DEnv == null || Site.Box2DEnv._world == null ) { return; }

	var nextBox2DBody = Site.Box2DEnv._world.m_bodyList;

	while( nextBox2DBody ) {
		if( nextBox2DBody != null && nextBox2DBody.m_userData != null ) {
			var newPosition = nextBox2DBody.GetPosition();
			
			nextBox2DBody.m_userData.setLocation(
				newPosition.x * DemoBox2D.Constants.PHYSICS_SCALE >> 0,
				newPosition.y * DemoBox2D.Constants.PHYSICS_SCALE >> 0
			);
			
//			console.log( nextBox2DBody.ID, newPosition.x * DemoBox2D.Constants.PHYSICS_SCALE >> 0, newPosition.y * DemoBox2D.Constants.PHYSICS_SCALE >> 0)
		}
		nextBox2DBody = nextBox2DBody.m_next;
	}
};

Site.Init = function() {
	var height = $("#canvas").height(),
		width = $("#canvas").width();

	Site.InitCAAT( height, width );

	var canvas = document.getElementById("canvas");
	Site.Box2DEnv = new Box2DTester( canvas );

	Site.Box2DEnv.draw();
	Site.Box2DEnv.resume();
	Site.InitStats();
};

Site.InitCAAT = function( height, width ) {
	var director = new CAAT.Director().initialize(
		width,    // 100 pixels wide
		height,    // 100 pixels across
		document.getElementById('canvas')
	);

	Site._scene = new CAAT.Scene().create();
	Site._scene.setFillStyle("#000000");

	director.addScene(Site._scene);
	director.loop( 60, Site.Loop );
};

Site.ID = 0;

Site.InitCaatFromBox2DLoop = function( box2DBody ) {
	var position = box2DBody.GetPosition();
	console.log( box2DBody.ID,
		position.x * DemoBox2D.Constants.PHYSICS_SCALE,
		position.y * DemoBox2D.Constants.PHYSICS_SCALE,
		box2DBody.w * DemoBox2D.Constants.PHYSICS_SCALE,
		box2DBody.h * DemoBox2D.Constants.PHYSICS_SCALE
	);

	box2DBody.m_userData = new CAAT.ShapeActor()
		.setShape( CAAT.ShapeActor.prototype.SHAPE_RECTANGLE )
		.create()
		.setLocation(
			position.x * DemoBox2D.Constants.PHYSICS_SCALE,
			position.y * DemoBox2D.Constants.PHYSICS_SCALE
		)
		.setSize(
			box2DBody.w * DemoBox2D.Constants.PHYSICS_SCALE,
			box2DBody.h * DemoBox2D.Constants.PHYSICS_SCALE
		)
		.setFillStyle( box2DBody._color );

	Site._scene.addChild( box2DBody.m_userData );
};

$( Site.Init );