!function(e){var i=Backbone.Model.extend({defaults:{name:"gruel",calories:200},addCalories:function(){this.set("calories",this.get("calories")+100)}}),n=Backbone.Collection.extend({model:i}),t=new n([new i({name:"chicken",calories:600}),new i({name:"rice",calories:200}),new i({name:"chocolate",calories:300})]),o=Backbone.View.extend({tagName:"li",events:{click:"addCaloriesToFood"},initialize:function(){this.listenTo(this.model,"change",this.render)},render:function(){return this.$el.html("<div>Type of Food: "+this.model.get("name")+"</div><div>Calories:&nbsp;"+this.model.get("calories")+"</div>"),this},addCaloriesToFood:function(){this.model.addCalories()}}),a=Backbone.View.extend({el:e("ul"),initialize:function(){self=this,this.total=e("#total"),this.listenTo(t,"change",this.render),t.each(function(e){var i=new o({model:e});self.$el.append(i.render().el)}),this.render()},render:function(){var e=0;t.each(function(i){e+=i.get("calories")}),this.total.text("Total Calories: "+e)}});new a}(jQuery);