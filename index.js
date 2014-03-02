var request = require( 'request' ),
  fs = require( 'fs' ),
  formula = require( './formulas/' + process.argv[2] + '.json' ),
  crawler = new ( require( 'crawler' ).Crawler )({
    maxConnections : 10,
    timeout : 10000,
    skipDuplicates : true,
    callback : function ( err, res, $ ) {
      if ( err ) return console.log( err );
      if ( !$ ) return;
      var $links = $(formula.content),
        $nextPage = $(formula.next),
        $images = $('img');
      
      function eachLink ( index, a ) {
        crawler.queue( a.href );
      }

      function eachImage ( index, img ) {
        var imageName = img.src.split('/').pop().split('?').shift(),
          options = {
            url : img.src,
            encoding : 'binary'
          };
        request(options, function ( err, res, body ) {
          if ( err ) return;
          var contentLength = res.headers['content-length'];
          if ( +contentLength > 10000 ) {
            fs.writeFile( formula.saveDir + decodeURIComponent(imageName), body, 'binary', function(){} );
          }
        });
      } 
      $images
        .filter(formula.imageFilter)
        .each( eachImage );
      $links.each( eachLink );
      $nextPage.each( eachLink );
    }
});
console.log(formula);
crawler.queue( formula.entryUrl );
