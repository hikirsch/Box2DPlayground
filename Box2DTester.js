function Box2DTester(canvasId) {
	this._fps = 200;
	this._velocityIterationsPerSecond = 200;
	this._positionIterationsPerSecond = 300;

	this.initCanvas(canvasId);
	this.createWorld();
	this.initCAAT();
}

Box2DTester.prototype = {
	initCanvas: function( canvasId ) {
		this._canvasEle = document.getElementById(canvasId);
		
		Site.Constants.GAME_WIDTH = this._canvasEle.clientWidth;
		Site.Constants.GAME_HEIGHT = this._canvasEle.clientHeight;
	},
	
	createWorld: function() {
		this._world = new b2World(new b2Vec2(0, 10), true);
		this._world.SetWarmStarting(true);

		// Create border of boxes
		var wall = new b2PolygonShape(),
			wallBd = new b2BodyDef();

		// Left
		var dimensions = new b2Vec2( 1 / Site.Constants.PHYSICS_SCALE, Site.Constants.GAME_HEIGHT / Site.Constants.PHYSICS_SCALE );
		wallBd.position.Set( 0, 0 );
		wall.SetAsBox( dimensions.x, dimensions.y );

		this._wallLeft = this._world.CreateBody(wallBd);
		this._wallLeft.w = dimensions.x;
		this._wallLeft.h = dimensions.y;
		this._wallLeft.CreateFixture2(wall);
		this._wallLeft.EntityID = Site.GetNextEntityID();

		// Right
		wallBd.position.Set( ( Site.Constants.GAME_WIDTH - 1 ) / Site.Constants.PHYSICS_SCALE, 0  );
		wall.SetAsBox( dimensions.x, dimensions.y );

		this._wallRight = this._world.CreateBody(wallBd);
		this._wallRight.w = dimensions.x;
		this._wallRight.h = dimensions.y;
		this._wallRight.CreateFixture2(wall);
		this._wallRight.EntityID = Site.GetNextEntityID();

		// BOTTOM
		dimensions = new b2Vec2( Site.Constants.GAME_WIDTH / Site.Constants.PHYSICS_SCALE, 1 / Site.Constants.PHYSICS_SCALE );
		wallBd.position.Set( 0, ( Site.Constants.GAME_HEIGHT - 1 ) / Site.Constants.PHYSICS_SCALE );
		wall.SetAsBox( dimensions.x, dimensions.y );

		this._wallBottom = this._world.CreateBody(wallBd);
		this._wallBottom.w = Site.Constants.GAME_WIDTH/ Site.Constants.PHYSICS_SCALE;
		this._wallBottom.h = 1 / Site.Constants.PHYSICS_SCALE;
		this._wallBottom.CreateFixture2(wall);
		this._wallBottom.EntityID = Site.GetNextEntityID();

		this._wallBottom._color = this._wallLeft._color = this._wallRight._color = "#ff0000";
	},

	update: function() {
		// derive passed time since last update. max. 10 secs
		var time = new Date().getTime(),
			delta = (time - this._lastUpdate) / 1000;

		this._lastUpdate = time;

		if(delta > 10) { delta = 1/this._fps; }

		this.step(delta);
		this.draw();
	},

	step: function(delta) {
		if( ! this._world ) { return; }

		this._world.ClearForces();

		delta = (typeof delta == "undefined")
			? 1/this._fps
			: delta;

		this._world.Step(delta, delta * this._velocityIterationsPerSecond, delta * this._positionIterationsPerSecond);
	},

	draw: function() {
		var nextBox2DBody = this._world.m_bodyList;
		while( nextBox2DBody ) {
			if( nextBox2DBody.m_userData == null ) {
				this.initCAATShapeFromBox2DBody( nextBox2DBody );
			}

			var newPosition = nextBox2DBody.GetPosition();

			nextBox2DBody.m_userData.setLocation(
				( newPosition.x - ( nextBox2DBody.w / 2 ) ) * Site.Constants.PHYSICS_SCALE >> 0,
				( newPosition.y - ( nextBox2DBody.h / 2) ) * Site.Constants.PHYSICS_SCALE >> 0
			);

			nextBox2DBody.m_userData.setRotation( nextBox2DBody.GetAngle() );

			nextBox2DBody = nextBox2DBody.m_next;
		}
	},

	createBoxes: function( count ) {
		for(var i = 0; i < count; i ++) {
			this.spawn(Site.Constants.BOX_WIDTH);
		}
	},

	spawn: function( boxSize ) {
		var nextID = Site.GetNextEntityID(),
			x = ( Math.random() * Site.Constants.GAME_WIDTH ) - boxSize,
			y = -( nextID * boxSize / 2 );

		var bodyDef = new b2BodyDef();
		bodyDef.type = b2Body.b2_dynamicBody;
		bodyDef.position.Set(
			x / Site.Constants.PHYSICS_SCALE,
			y / Site.Constants.PHYSICS_SCALE
		);

		var body = this._world.CreateBody(bodyDef);
		body.w = boxSize / Site.Constants.PHYSICS_SCALE;
		body.h = boxSize / Site.Constants.PHYSICS_SCALE;
		body.EntityID = nextID;
		body._color = '#' + CAAT.Color.prototype.hsvToRgb( ( body.EntityID * 15 ) % 360, 40, 99 ).toHex();

		var shape = new b2PolygonShape.AsBox(body.w, body.h);

		var fixtureDef = new b2FixtureDef();
		fixtureDef.restitution = 0.5;
		fixtureDef.density = 1.0;
		fixtureDef.friction = 0.2;
		fixtureDef.shape = shape;

		body.CreateFixture(fixtureDef);

		return body;
	},

	initCAAT: function( canvasId ) {
		var director = new CAAT.Director().initialize( Site.Constants.GAME_WIDTH, Site.Constants.GAME_HEIGHT, this._canvasEle ),
			that = this;

		this._scene = new CAAT.Scene().create();
		this._scene.setFillStyle("#000000");

		director.addScene(this._scene);
		director.loop( 30, function() {
			that.update();
		});
	},

	initCAATShapeFromBox2DBody: function( box2DBody ) {
		console.log( "CAAT:",
			box2DBody.EntityID,
			box2DBody.w * Site.Constants.PHYSICS_SCALE,
			box2DBody.h * Site.Constants.PHYSICS_SCALE,
			box2DBody.GetPosition().x * Site.Constants.PHYSICS_SCALE,
			box2DBody.GetPosition().y * Site.Constants.PHYSICS_SCALE
		);

		box2DBody.m_userData = new CAAT.ShapeActor()
			.setShape( CAAT.ShapeActor.prototype.SHAPE_RECTANGLE )
			.create()
			.setSize(
				box2DBody.w * Site.Constants.PHYSICS_SCALE * 2,
				box2DBody.h * Site.Constants.PHYSICS_SCALE * 2
			)
			.setFillStyle( box2DBody._color )

		this._scene.addChild( box2DBody.m_userData );
	}
};