;(function ($, window, document, undefined) {

    var pluginName = "imageTile",
        dataKey = "plugin_" + pluginName;

    // Private Methods

    // Set initial data values to handle transitions
    var setMetadata = function(ele) {
      var parent = $(ele).parent('li'),
          data = {
            loaded: true,
            full: false,
            initialized: false,
            index: parent.index(),
            initialIndex: parent.data('image-index') || 0,
            height: ele.height,
            originalImageSrc: $(ele).attr('src'),
            tileHeight: ele.height / this.options.verticalTiles,
            tileWidth: ele.width / this.options.horizontalTiles,
            width: ele.width,
          };
      return parent.data(data);
    };

    // Update tile properties to move background image position
    var updateProperties = function(ele, img, data){
      var parent = $(ele).parent('li');

      // Show image index desired
      var index =  data.index;
      if ( !data.initialized ){
        index = data.initialIndex;
      }

      x = parseInt(index % this.options.horizontalTiles);
      y = parseInt(index / this.options.horizontalTiles);

      properties = {
        'background-image': 'url(' + img + ')',
        'background-position-x': '-' + (x * data.tileWidth) + 'px',
        'background-position-y': '-' + (y * data.tileHeight) + 'px',
        'height': data.tileHeight + 'px',
        'width': data.tileWidth + 'px'
      };
      parent.css(properties);

      // Set copy image placeholder
      if ( !parent.data('initialized') ){
        parent.find('.placeholder.image').css(properties);
      }

      parent.data('initialized', true);
    };

    // Listen image tile click events and trigger onChange imageTile event
    var bindItemClick = function(ele){
      var that = this;
      $(ele).parent('li').on('click', function(){
        var target = $(this),
            outerImage = target.find('img');

        if ( target.data().full ){
          target.data('full', false).removeClass('image-active');
          restoreTiles(that);
        } else {
          target.data('full', true).addClass('image-active');
          changeTiles(that, outerImage.attr('src'));
        }

        that.options.onChange(target, target.data());
      });
    };

    // Handle grid image change to new background image
    var changeTiles = function(scope, src){
      scope.element.find('li').each(function(index, item){
        var  innerImage = $(item).find('img');
        updateProperties.call(scope, innerImage, src, $(item).data());
      }).addClass('is-full-image');
    };

    // Handle restore grid images to original state
    var restoreTiles = function(scope){
      scope.element.find('li').each(function(index, item){
        var innerImage = $(item).find('img')
        $(item).data('initialized', false);
        updateProperties.call(scope, innerImage, innerImage.attr('src'), $(item).data());
      }).removeClass('is-full-image');
    };

    // ImageTile object definition
    var ImageTile = function (element, options) {
        this.element = element;

        this.options = {
          horizontalTiles: 4,
          verticalTiles: 2,
          onChange: function(ele, data){}
        };

        this.init(options);
    };

    // Extend imageTile objects
    ImageTile.prototype = {

        // initialize options
        init: function (options) {
            $.extend(this.options, options);

            var that = this;

            this.element.addClass('image-tile-container');

            // Hide images, and bind load event to get width/height
            this.element.find('li > img').load(function(){
              var image = $(this),
                  parent = image.parent('li');
              setMetadata.call(that, this)
              updateProperties.call(that, image, this.src, parent.data());
              bindItemClick.call(that, this);
            }).data({ loaded: false })
        },

        // Public methods
        publicMethod: function (callback) {
        }
    };

    /*
     * Plugin wrapper, preventing against multiple instantiations and
     * return plugin instance.
     */
    $.fn[pluginName] = function (options) {

        var plugin = this.data(dataKey);

        // has plugin instantiated ?
        if (plugin instanceof ImageTile) {
            // if have options arguments, call plugin.init() again
            if (typeof options !== 'undefined') {
                plugin.init(options);
            }
        } else {
            plugin = new ImageTile(this, options);
            this.data(dataKey, plugin);
        }

        return plugin;
    };

}(jQuery, window, document));
