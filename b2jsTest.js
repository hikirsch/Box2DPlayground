var Box2DTester = function() {
	this._paused = true;
	this._fps = 200;

	this._velocityIterationsPerSecond = 300;
	this._positionIterationsPerSecond = 200;
	
	this._world = this.createWorld();

	this.createBoxes();
};

Box2DTester.prototype.createBoxes = function() {
	for(var i = 0; i < 100; i ++) {
		 this.spawn(
			 ( ( i  % 5 ) * 25 ) + 150,
			 0 
		 );
	}
};

Box2DTester.prototype.destroy = function() {
	this.pause();

	this._world = null;
};

Box2DTester.prototype.createWorld = function(){
	var m_world = new b2World(new b2Vec2(0, 10), true);
	m_world.SetWarmStarting(true);

	// Create border of boxes
	var wall = new b2PolygonShape(),
		wallBd = new b2BodyDef();

	// Left
	var dimensions = new b2Vec2( 1 / DemoBox2D.Constants.PHYSICS_SCALE, DemoBox2D.Constants.GAME_HEIGHT / DemoBox2D.Constants.PHYSICS_SCALE );
	wallBd.position.Set( 0, 0 );
	wall.SetAsBox( dimensions.x, dimensions.y );

	this._wallLeft = m_world.CreateBody(wallBd);
	this._wallLeft.w = dimensions.x;
	this._wallLeft.h = dimensions.y;
	this._wallLeft.CreateFixture2(wall);
	this._wallLeft.ID = Site.ID++;

	// Right
	dimensions = new b2Vec2( 1 / DemoBox2D.Constants.PHYSICS_SCALE, DemoBox2D.Constants.GAME_HEIGHT / DemoBox2D.Constants.PHYSICS_SCALE );
	wallBd.position.Set( ( DemoBox2D.Constants.GAME_WIDTH - 1 ) / DemoBox2D.Constants.PHYSICS_SCALE, 0  );
	wall.SetAsBox( dimensions.x, dimensions.y );

	this._wallRight = m_world.CreateBody(wallBd);
	this._wallRight.w = dimensions.x;
	this._wallRight.h = dimensions.y;
	this._wallRight.CreateFixture2(wall);
	this._wallRight.ID = Site.ID++;

	// BOTTOM
	dimensions = new b2Vec2( DemoBox2D.Constants.GAME_WIDTH / DemoBox2D.Constants.PHYSICS_SCALE, 1 / DemoBox2D.Constants.PHYSICS_SCALE );
	wallBd.position.Set( 0, ( DemoBox2D.Constants.GAME_HEIGHT - 1 ) / DemoBox2D.Constants.PHYSICS_SCALE );
	wall.SetAsBox( dimensions.x, dimensions.y );

	this._wallBottom = m_world.CreateBody(wallBd);
	this._wallBottom.w = DemoBox2D.Constants.GAME_WIDTH/ DemoBox2D.Constants.PHYSICS_SCALE;
	this._wallBottom.h = 1 / DemoBox2D.Constants.PHYSICS_SCALE;
	this._wallBottom.CreateFixture2(wall);
	this._wallBottom.ID = Site.ID++;

	this._wallBottom._color = this._wallLeft._color = this._wallRight._color = "#ff0000";
//		// TOP
//		wallBd.position.Set(DemoBox2D.Constants.GAME_WIDTH/2 * DemoBox2D.Constants.PHYSICS_SCALE - 1, 1);
//		wall.SetAsBox(DemoBox2D.Constants.GAME_WIDTH/2, 1);
//		this._wallBottom = m_world.CreateBody(wallBd);
//		this._wallBottom.CreateFixture2(wall)
	
	return m_world;
};

Box2DTester.prototype.draw = function() {
	var nextBox2DBody = this._world.m_bodyList;
	
	while( nextBox2DBody ) {
		if( nextBox2DBody.m_userData == null ) {
			Site.InitCaatFromBox2DLoop( nextBox2DBody );
		}
		
		nextBox2DBody = nextBox2DBody.m_next;
	}
};

Box2DTester.prototype.step = function(delta) {
	if( ! this._world ) { return; }

	this._world.ClearForces();

	delta = (typeof delta == "undefined")
		? 1/this._fps
		: delta;

	this._world.Step(delta, delta * this._velocityIterationsPerSecond, delta * this._positionIterationsPerSecond);
};

Box2DTester.prototype._update = function() {
	// derive passed time since last update. max. 10 secs
	var time = new Date().getTime(),
		delta = (time - this._lastUpdate) / 1000;

	this._lastUpdate = time;

	if(delta > 10) { delta = 1/this._fps; }

	this.step(delta);
	this.draw();
	
	if(!this._paused) {
		var that = this;
		this._updateTimeout = window.setTimeout(function(){that._update()});
	}
};

Box2DTester.prototype.resume = function() {
	if(this._paused) {
		this._paused = false;
		this._lastUpdate = 0;
		this._update();
	}
};

Box2DTester.prototype.pause = function() {
	this._paused = true;

	window.clearTimeout(this._updateTimeout);
};

Box2DTester.prototype.isPaused = function() {
	return this._paused;
};

Box2DTester.prototype.spawn = function(x, y, a) {
	var bodyDef = new b2BodyDef();
	bodyDef.type = b2Body.b2_dynamicBody;
	
	bodyDef.position.Set(
		x / DemoBox2D.Constants.PHYSICS_SCALE,
		y / DemoBox2D.Constants.PHYSICS_SCALE
	);
	
//	bodyDef.angle = a;
	var body = this._world.CreateBody(bodyDef);
	body.w = 20 / DemoBox2D.Constants.PHYSICS_SCALE;
	body.h = 20 / DemoBox2D.Constants.PHYSICS_SCALE;

	var shape = new b2PolygonShape.AsBox(body.w, body.h);

	var fixtureDef = new b2FixtureDef();
	fixtureDef.restitution = 0.0;
	fixtureDef.density = 2.0;
	fixtureDef.friction = 1.0;
	fixtureDef.shape = shape;

	body.CreateFixture(fixtureDef);
	body.ID = Site.ID++;
	
	body._color = '#' + CAAT.Color.prototype.hsvToRgb( ( body.ID * 15 ) % 360, 40, 99 ).toHex();

	
	return body;
};

//  Box2DTester.prototype._colors = [ "#ff0000", "#00ff00", "#0000ff"];