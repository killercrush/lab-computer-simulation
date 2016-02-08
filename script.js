(function comp_model() {
    'use strict';

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var lam1 = 1 / 30,
        lam2 = 1 / 30,
        p1 = 0.65,
        p2 = 0.85,
        S1 = 560,
        S2 = 50,
        N = 10,
        T = 30;

    var T1 = [
        {
            workers_count: 1,
            duration: 40,
            disp: 15
        },
        {
            workers_count: 2,
            duration: 29,
            disp: 11
        },
        {
            workers_count: 3,
            duration: 22,
            disp: 8
        }
];

    var T2 = [
        {
            workers_count: 2,
            duration: 40,
            disp: 10
        },
        {
            workers_count: 3,
            duration: 25,
            disp: 17
        },
];

    var T3 = [
        {
            workers_count: 1,
            duration: 28,
            disp: 9
        },
        {
            workers_count: 2,
            duration: 20,
            disp: 8
        },
];

    var T4 = [
        {
            workers_count: 1,
            duration: 40,
            disp: 10
        },
        {
            workers_count: 2,
            duration: 30,
            disp: 7
        },
        {
            workers_count: 3,
            duration: 20,
            disp: 5
        },
        {
            workers_count: 4,
            duration: 16,
            disp: 4
        }
];



    function Unit(id, time_arriv) {
        this.id = id;        
        this.need_adj = false;
        this.time_arriv = time_arriv;
        this.time_st1 = {beg: undefined, end: undefined};
        this.time_st2 = {beg: undefined, end: undefined};
        this.time_st3 = {beg: undefined, end: undefined};

        this.status = function () {
            return "Unit #" + id + " status: " +
                st1 + ", " + st2 + ", " + st3;
        }
        this.print = function () {
            return "Unit #" + id;
        }
    }



    function Product(u1, u2, price) {
        this.u1 = u1;
        this.u2 = u2;
        this.price = price;
        this.print = function () {
            return "Unit #" + this.u1.id + " & Unit #" + this.u2.id;
        }
    }

    // Операция подгонки
    function FirstStage(params, in1, in2, out, price) {
        this.in_process = false;
        this.timer = 0;
        this.unit1 = undefined;
        this.unit2 = undefined;
        this.process = function (curr_time) {
            if (this.in_process) {
                this.timer--;
                if (this.timer == 0) {
                    this.in_process = false;
                    this.unit1.time_st1.end = curr_time;
                    this.unit2.time_st1.end = curr_time;
                    out.push(new Product(this.unit1, this.unit2, price));
                    console.log(this.unit1.print() + " is finished stage 1");
                    console.log(this.unit2.print() + " is finished stage 1");
                }
                return;
            }
            if (in1.length == 0 || in2.length == 0) {
                return;
            }
            this.timer = params.duration + getRandomInt(-params.disp, params.disp);
            this.unit1 = in1.shift();
            this.unit2 = in2.shift();
            this.unit1.time_st1.beg = curr_time;
            this.unit2.time_st1.beg = curr_time;
            console.log(this.unit1.print() + " is on stage 1");
            console.log(this.unit2.print() + " is on stage 1");
            this.in_process = true;
        }
    }

    // Операция доводки
    function SecondStage(params1, adj_p1, params2, adj_p2, in_queue, out_queue) {
        this.in_process = false;
        this.timer = 0;
        var product = undefined;
        var queue = [];
        this.getQueue = function() {
            return queue;
        }
        this.check = function() {
            if (in_queue.length == 0) {
                return;
            }
            var check_product = in_queue.shift();
            
            check_product.u1.need_adj = Math.random() <= adj_p1;
            check_product.u2.need_adj = Math.random() <= adj_p2;
            
            if (check_product.u1.need_adj || check_product.u2.need_adj) {
                queue.push(check_product);
            } else {
                out_queue.push(check_product);
            }
        }
        this.process = function (curr_time) {
            if (this.in_process) {
                this.timer--;
                if (this.timer == 0) {
                    this.in_process = false;
                    console.log(product.print() + " is finished stage 2");
                    product.u1.time_st2.end = curr_time;
                    product.u2.time_st2.end = curr_time;
                    out_queue.push(product);
                }
                return;
            }
            
            if (queue.length == 0) {
                return;
            }
            
            product = queue.shift();
            console.assert(product.u1.need_adj || product.u2.need_adj, "both unit do not need adjusting");
            console.assert(this.timer === 0, "timer is not zero");
            if (product.u1.need_adj) this.timer += params1.duration + getRandomInt(-params1.disp, params1.disp);
            if (product.u2.need_adj) this.timer += params2.duration + getRandomInt(-params2.disp, params2.disp);     
            console.log(product.print() + " is on stage 2 (" + product.u1.need_adj + ", " + product.u2.need_adj + ")");
            product.u1.time_st2.beg = curr_time;
            product.u2.time_st2.beg = curr_time;
            this.in_process = true;
        }

        //  this.process = function() {
        //    if (this.in_process) {
        //      this.timer--;
        //      if (this.timer == 0) {
        //        this.in_process = false;
        //        return this.unit;
        //      }
        //    }
        //  }
    }

    // Сборка
    function ThirdStage(params, in_queue, out_queue) {
        this.in_process = false;
        this.timer = 0;
        var product = undefined;
        this.process = function (curr_time) {
            if (this.in_process) {
                this.timer--;
                if (this.timer == 0) {
                    this.in_process = false;
                    console.log(product.print() + " is finished stage 3");
                    product.u1.time_st3.end = curr_time;
                    product.u2.time_st3.end = curr_time;
                    out_queue.push(product);
                }
                return;
            }
            if (in_queue.length == 0) {
                return;
            }
            console.assert(this.timer === 0, "timer is not zero");
            this.timer = params.duration + getRandomInt(-params.disp, params.disp);
            product = in_queue.shift();
            console.log(product.print() + " is on stage 3, time left: " + this.timer);
            product.u1.time_st3.beg = curr_time;
            product.u2.time_st3.beg = curr_time;
            this.in_process = true;
        }
    }

    function start_simulation (idx1, idx2, idx3, idx4) {
        var minutes = 0,
            unit_queue1 = [],
            unit_queue2 = [],
            after_st1_queue = [],
            after_st2_queue = [],
            res_queue = [];

        var first_stage  = new FirstStage (T1[idx1], unit_queue1, unit_queue2, after_st1_queue, S1),
            second_stage = new SecondStage(T2[idx2], p1,  T3[idx3], p2, after_st1_queue, after_st2_queue),
            third_stage  = new ThirdStage (T4[idx4], after_st2_queue, res_queue);
        
        var work_duration = 480;
        var sim_count = 10;
        while(sim_count-- !== 0){
          while (minutes < work_duration) {
              if (minutes % 30 == 0) {
                  unit_queue1.push(new Unit('u1_' + minutes, minutes));
                  unit_queue2.push(new Unit('u2_' + minutes, minutes));
              }

              first_stage.process(minutes);
              second_stage.check();
              second_stage.process(minutes);
              third_stage.process(minutes);
              
              minutes++;
          }

          // console.log("unit_queue1: ", unit_queue1);
          // console.log("unit_queue2: ", unit_queue2);
          // console.log("after_st1_queue: ", after_st1_queue);
          // console.log("need adj queue: ", second_stage.getQueue());
          // console.log("after_st2_queue: ", after_st2_queue);
          // console.log("res_queue: ", res_queue);

          res_queue.forEach(function(product) {
            if (product.u1.time_st3.end - product.u1.time_st1.end > T) product.price /= 2;
            // console.log( "st1: " + product.u1.time_st1.beg + " - " +  product.u1.time_st1.end +
            //             " st2: " + product.u1.time_st2.beg + " - " +  product.u1.time_st2.end +
            //             " st3: " + product.u1.time_st3.beg + " - " +  product.u1.time_st3.end + 
            //             " price: " + product.price);
          });

          var profit = res_queue.reduce(function (p, c) {
            return p + c.price;
          }, 0);
          //console.log("profit: " + profit);

          var all_workers_count = T1[0].workers_count + T2[1].workers_count + T3[1].workers_count + T4[3].workers_count;
          console.assert(all_workers_count <= N, "more  than N workers");

          var salary = (work_duration / 60) * S2 * all_workers_count;
          //console.log("workers count: " + all_workers_count + ", salary: " + salary);
        }

    }



    var T1_idx, T2_idx, T3_idx, T4_idx = 0;

    while(T1_idx++ < T1.length)
      while(T2_idx++ < T2.length)
        while(T3_idx++ < T3.length)
          while(T4_idx++ < T4.length)
            start_simulation(T1_idx, T2_idx, T3_idx, T4_idx);





})();