export function buildLunchSummaries(lunches: any[]) {
  var results = []

  for (var i = 0; i < lunches.length; i++) {
    var lunch = lunches[i]
    results.push(
      lunch.name + ' - ' + lunch.category + ' - ' + lunch.prepTimeMinutes + ' min',
    )
  }

  return results
}