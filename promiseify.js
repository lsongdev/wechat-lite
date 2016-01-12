/**
 * [promiseify description]
 * @param  {[type]} creator [description]
 * @return {[type]}         [description]
 */
module.exports = function promiseify(creator){
  return new Promise(function(accept, reject){
    creator.call(this, function(err, res){
      if(err) return reject(err);
      accept(res);
    });
  });
};
