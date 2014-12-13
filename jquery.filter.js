// plugin definition
// author: necotan@github.com 
//

if(!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

(function($) { 

  // 
  // plugin definition 
  // 
  // this plugin is use a list of element with data-* to generate a filter bar
  // 
  //  
  
  // plugin defaults - added as a property on our plugin function
  var defaults = {
    //the selector of dom element place filter_bar
    parent:'.filter',
    //cell to filter's selector
    cell : '.cell', 
    search: true,
    //must be fillin
    fdisplay:{
       //the data-* to filter : the name display
       //eg:
       //na:"Name",
       //money:"cost",
    },
    //can be empty 
    fformat:{
      //use {0} as val string
      //need format 
      //na: " {0} M ",
      //money:" $ {0} "    
    },
    //can be empty
    fsort:[] 
  };
  
  var data = {}
  var __sift_target = {}
  var __FILTER_VIS = null;
  
  $.fn.filter_bar = function(options) { 
    // Extend our default options with those provided. 
    // Note that the first arg to extend is an empty object - 
    // this is to keep from overriding our "defaults" object. 
    var opts = $.extend(defaults, $.fn.filter_bar.defaults, options); 
    // Our plugin implementation code goes here. 

    var cell_selector = opts.cell
    var $self = $(this);
    
    var parent = $(opts.parent);
    if(parent.length  == 0){
      parent = $(this).prev('<div class="jquery-filter-area"></div>')
    }else{
      parent.addClass('jquery-filter-area')
    }
    
    var cells = $self.find(opts.cell);
    
    for( target in opts.fdisplay){
      data[target] = []
    }
    
    console.log(cells)
    //load filter data
    cells.each(function(){
      for( target in opts.fdisplay){
        var val = $(this).data(target)
        //console.log(val)
        if(data[target].indexOf(val) == -1){
          data[target].push(val) 
        }
      }    
    })
    
    //console.log(data)
    //add filter
    for(target in opts.fdisplay){
      var row = $('<div class="_filter-row"></div>')
      var left_title = $('<div class="_filter-title"><label class="_filter_title">{0}</lable></div>'.format(opts.fdisplay[target]))
      var right_bar = $('<div class="_filter-bar"></div>')
      var ul = $('<ul class="_filter-ul"></ul>') 
      
      var values = data[target]
      var fstr = opts.fformat[target]
      if(fstr == undefined){ fstr = '{0}'}
      for(var i =0; i < values.length; i++){
        ul.append('<li><a href="" class="_filter-cell" data-target="{2}" data-value="{0}">{1}</a></li>'.format(values[i], fstr.format(values[i]),target))
      }
      
      right_bar.append(ul)
      row.append(left_title)
      row.append(right_bar)
      
      parent.append(row)
    }
    
    var filter_tag_row = $('<div class="_filter-row">'+
    '<div class="_filter-title"><label class="_filter_title">Filter</label></div>'+
    '<div class="_filter-bar"><ul class="_filter-ul _filter-ul-tag "></ul></div>'+
    '</div>')
    
    parent.append(filter_tag_row);
    
    
    if(opts.search == true){
       $self.prepend('<div class="right-inner-addon">' +
            '<span class="glyphicon glyphicon-search"></span>' +
            '<input type="search"  class="form-control _filter-search" placeholder="Search..." />'+
        '</div>')
    }

  //add event handler  
  $("a._filter-cell").click(function(e) {
      //made search update
      __FILTER_VIS == null;
      //empty search
      $("input._filter-search").val('');
      
      var dv = $(this).data("value");
      var value = $(this).text();
      if(dv != undefined){
        value = dv;
      }
      
      var target = $(this).data("target");

      //set filter old 
      var old = __sift_target[target]
      if(old != undefined){
      
        //click same btn again set unfilter
        if(old == value){
          $("ul._filter-ul-tag").find("a[data-target="+target+"]").click();
          __sift_target[target] = undefined
          e.preventDefault();
          console.log('old');
          return false;
        }    
        //show cell
        $(cell_selector).show();
        //remove filter_tag
        $("ul._filter-ul-tag").find("a[data-target="+target+"]").parents('li').remove();          
      }
      
      __sift_target[target] = value    
      //sift
      for( s in __sift_target){
        sift_cell(s, __sift_target[s], cell_selector);
      }     
      
      //add filter bar
      var fl = $('<li class="_filter_tag" ><a class="_unfilter" ><span class="text"></span> <span class="glyphicon glyphicon-remove"></span></a></li>')      
      
      fl.find('a').attr('data-target', target);
      fl.show();
      fl.find('span.text').text($(this).text());
      $("ul._filter-ul-tag").append(fl);
      
      e.preventDefault();
      return false;
  });  
  
  $( "ul._filter-ul-tag" ).delegate("a._unfilter", "click", function(e) {
   
      //console.log($(e.target));
      
      var _unfilter = $(e.target).parents('li').find("a")
      __sift_target[_unfilter.data('target')] = undefined
      
      $(e.target).parents('li').remove();
      $(cell_selector).show();
      
      //sift
      $("ul._filter-bar li:visible").each(function(){
         var target = $(this).find('a').data('target');
         var value = __sift_target[target];
         sift_cell(target, value, cell_selector);
      });
      
      e.preventDefault();
      e.stopPropagation();
      return false;
   }); 
    

   $("input._filter-search").bind('keyup', function(event){
   
    var sa = $(this).val().toLowerCase();
    var target = $("{0}:visible".format(cell_selector));
    
    if(__FILTER_VIS == null){
      __FILTER_VIS = target; 
    }
    
    if($.trim(sa) == '')
    {
      __FILTER_VIS.show();
      __FILTER_VIS = null;
      return
    }
    
    //backspace == ''
    var key = event.keyCode || event.charCode;
    if(key == 8){  __FILTER_VIS.show(); }
    //console.log(sa);
    target.each(function(e) {
      if(-1 == $(this).html().toLowerCase().search(sa)){
        $(this).hide();
      };   
    }); 
    
   });
    
    //add bootstrap class
    parent.find('ul').addClass("nav nav-pills");
    
    // over 
    return this;
  }; 

   function sift_cell(target, value, cell){
      if(value == undefined){
        return
      }
      var now = $("{0}:hidden".format(cell));
      $(cell).hide();
      $("{0}[data-{1}={2}]".format(cell, target,value)).show();
      now.hide();
   }
  
})(jQuery)
