angular.module("app", [])
.service("tasksService", function () {

  // Private data
  var tasks = [];
  var archivedTasks = [];

  return {
    // Accessor
    tasks : function () {
      return tasks;
    },

    addTask : function (taskTitle) {
      console.log('adding : ' + taskTitle);
      tasks.push({title : taskTitle, done : false});
    },

    archive : function () {
      var toArchiveTasks = tasks.slice();
      tasks.length = 0;

      toArchiveTasks.forEach(function (task, index) {
        if(task.done == true) {
          archivedTasks.push(task);
        }
        else{
          tasks.push(task);
        }
      });
    },
    remaining : function () {
      var done = 0;
      tasks.forEach( function(task, index) {
        if(task.done) {
          done++;
        }
      });
      return done;
    }
  };
})
.service('notificationService', function () {

  return {
    playSound : function () {
      $('#notification').html(
        "<audio autoplay='autoplay'> \
        <source src='resources/notification.mp3' type='audio/mpeg' /> \
        </audio>");
      }
    }
  })
  .controller('TaskCtrl', ['$scope', 'tasksService', function($scope, tasksService) {

    // Bind view tasks to the service data
    $scope.tasks = tasksService.tasks();

    $scope.remaining = function () {
      return tasksService.remaining();
    }

    $scope.addTask = function () {
      tasksService.addTask($scope.taskTitle);
      $scope.taskTitle = '';
    }

    // Remove checked tasks
    $scope.archive = function()  {
      tasksService.archive();
    }
  }
])
.controller("TimerCtrl", ['$scope', '$interval', 'notificationService', function($scope, $interval, notificationService) {
  $scope.timerDuration = 5;
  $scope.showTimeLeft = false;
  $scope.timerStarted = false;
  $scope.timeLeft = -1; // Display "Timer Expired" when = 0
  $scope.timerHistory = [];

  var timerPromise;
  var startTime = 0;

  $scope.startTimer = function () {
    $scope.showTimeLeft = true;
    $scope.timerStarted = true;
    startTime = new Date().getTime();
    $scope.timeLeft = $scope.timerDuration * 60 * 1000;

    // Add new timer history
    $scope.timerHistory.unshift({start : startTime, end : '- - -'});

    timerDurationMs = $scope.timerDuration * 60 *  1000;

    timerPromise = $interval(function() {
      $scope.timeLeft = timerDurationMs - (new Date().getTime() - startTime);
      if($scope.timeLeft <= 0) {
        $scope.timeOut();
        $scope.stopTimer();
      }
    }, 1000);
  }

  $scope.stopTimer = function () {
    $scope.timerStarted = false;
    $scope.timeLeft = 0;
    $scope.timerHistory[0].end = new Date().getTime();
    $interval.cancel(timerPromise);
  }

  // Play sound on timer timeout
  $scope.timeOut = function () {
    notificationService.playSound();
  }
}]);
