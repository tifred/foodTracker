var app=app||{};app.RecentResultView=Backbone.View.extend({tagName:"li",template:_.template($("#recent-result-template").html()),events:{"click div":"createFood"},initialize:function(){},render:function(){return this.$el.html(this.template(this.model.attributes)),this},createFood:function(){var e=this.model.get("name"),t=this.model.get("calories");app.foods.create({name:e,calories:t})}});