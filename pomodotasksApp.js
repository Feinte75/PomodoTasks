angular.module('app', [])
.service('tasksService',
function () {
  // Private data
  var tasks = []
  var archivedTasks = []

  return {
    // Accessor
    tasks: function () {
      return tasks
    },

    archivedTasks: function () {
      return archivedTasks
    },

    addTask: function (taskTitle, estimatedPomo) {
      var elements = taskTitle.split(' ')
      var tags = []
      // Recover tags from task title
      elements.forEach(function (element) {
        if (element[0] === '#') {
          tags.push(element.substring(1))
        }
      })
      tasks.push({title: taskTitle, tags: tags, estimatedPomo: estimatedPomo, active: false, date: '', pomodoro: 0})
    },

    addPomodoro: function () {
      tasks.filter(task => task.active).forEach(task => { task.pomodoro += 1 })
    },

    archive: function () {
      var toArchiveTasks = tasks.filter(task => task.active)

      tasks = tasks.filter(task => !task.active)
      var date = new Date().getTime()

      toArchiveTasks.forEach(function (task) {
        task.date = date
        archivedTasks.push(task)
      })
    },

    active: function () {
      return tasks.filter(task => task.active).length
    }
  }
})
.service('notificationService', function () {
  return {
    playSound: function () {
      $('#notification').html(
        "<audio autoplay='autoplay'>" +
        "<source src='resources/notification.mp3' type='audio/mpeg' />" +
        '</audio>')
    }
  }
})
  .controller('TaskCtrl', ['$scope', 'tasksService', function ($scope, tasksService) {
    // Bind view tasks to the service data
    $scope.tasks = tasksService.tasks()
    $scope.archivedTasks = tasksService.archivedTasks()

    $scope.active = function () {
      return tasksService.active()
    }

    $scope.addTask = function () {
      tasksService.addTask($scope.taskTitle, $scope.estimatedPomo)
      $scope.taskTitle = ''
    }

    // Remove checked tasks
    $scope.archive = function () {
      tasksService.archive()
      $scope.tasks = tasksService.tasks()
    }
  }
  ])
.service('settingsService', function () {
  var defaultSettings = {
    pomodoroTimerDuration: 0.01,
    smallBreakTimerDuration: 0.01,
    longBreakTimerDuration: 0.01,
    playSound: true
  }

  var settings = {}

  // Handle settings menu disable when click outside
  function modalClose () {
    if (window.location.hash === '#openSettings') {
      window.location.hash = ''
    }
  }

  var modal = document.querySelector('#openSettings')
  modal.addEventListener('click', function (e) {
    modalClose()
  }, false)

  modal.children[0].addEventListener('click', function (e) {
    e.stopPropagation()
  }, false)

  // Recover settings from localStorage if present
  for (var setting in defaultSettings) {
    if (defaultSettings.hasOwnProperty(setting)) {
      var tmp = window.localStorage.getItem(setting)
      if (tmp != null) {
        settings[setting] = tmp
      } else {
        settings[setting] = defaultSettings[setting]
      }
    }
  }

  return {
    settings: function () {
      return settings
    },

    persistSettings: function () {
      for (var setting in settings) {
        if (settings.hasOwnProperty(setting)) {
          window.localStorage.setItem(setting, settings[setting])
          window.location.hash = ''
        }
      }
    }
  }
})
.controller('TimerCtrl', ['$scope', '$interval', 'notificationService', 'tasksService', 'settingsService',
  function ($scope, $interval, notificationService, tasksService, settingsService) {
    var settings = settingsService.settings()
    $scope.timerDuration = settings.pomodoroTimerDuration
    $scope.showTimeLeft = false
    $scope.timerStarted = false
    $scope.timeLeft = -1 // Display "Timer Expired" when = 0
    $scope.timerHistory = []

    var timerPromise
    var startTime = 0

    $scope.startTimer = function (timerType) {
      var timerDuration = 0
      switch (timerType) {
        case 'pomodoro':
          timerDuration = settings.pomodoroTimerDuration
          break
        case 'smallBreak':
          timerDuration = settings.smallBreakTimerDuration
          break
        case 'longBreak':
          timerDuration = settings.longBreakTimerDuration
          break
        default:
          console.log('Invalid timer type')
      }
      $scope.timerType = timerType

      $scope.showTimeLeft = true
      $scope.timerStarted = true
      startTime = new Date().getTime()

    // Add new timer history
      $scope.timerHistory.unshift({start: startTime, end: '- - -', type: timerType})

      $scope.timerDurationMs = timerDuration * 60 * 1000
      $scope.timeLeft = $scope.timerDurationMs

      timerPromise = $interval(function () {
        $scope.timeLeft = $scope.timerDurationMs - (new Date().getTime() - startTime)
        if ($scope.timeLeft <= 0) {
          $scope.timeOut()
          $scope.stopTimer()
        }
      }, 1000)
    }

    $scope.stopTimer = function () {
      $scope.timerStarted = false
      $scope.timeLeft = 0
      $scope.timerHistory[0].end = new Date().getTime()
      $interval.cancel(timerPromise)
    }

  // Play sound on timer timeout
    $scope.timeOut = function () {
      if (settings.playSound === true) {
        notificationService.playSound()
      }
      if ($scope.timerType === 'pomodoro') {
        tasksService.addPomodoro()
      }
    }
  }
])
.controller('SettingsCtrl', ['$scope', 'settingsService', function ($scope, settingsService) {
  $scope.settings = settingsService.settings()

  $scope.applySettings = function () {
    settingsService.persistSettings()
    window.location.hash = ''
  }
}])
