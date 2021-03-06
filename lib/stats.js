const conferences = require('./conferences')
const db = require('./db')

const getOnlineParticipantStats = async () => {
  try {
    const phoneNumbers = await conferences.getAllPhoneNumbers()
    console.log(`stats got ${phoneNumbers.length} phoneNumbers`)

    const promises = phoneNumbers.map(async phoneNumber => {
      try {
        return await conferences.getNumberOnlineParticipants(phoneNumber)
      } catch (err) {
        console.log(`Error in getNumberOnlineParticipants for ${phoneNumber}`, err)
        return err
      }
    })
    const results = await Promise.all(promises)

    const totals = results.reduce((totals, numberOnlineParticipants) => {
      if (typeof numberOnlineParticipants === 'number') {
        totals.onlineParticipantsCount += numberOnlineParticipants
        totals.activeConfsCount += (numberOnlineParticipants > 0) ? 1 : 0
        return totals
      }
      totals.errorConfsCount += 1
      return totals
    }, { onlineParticipantsCount: 0, activeConfsCount: 0, errorConfsCount: 0})

    console.log('stats', totals)
    return totals
  } catch (err) {
    console.error(`Error getTotalOnlineParticipants`, err)
    throw new Error(`Error getTotalOnlineParticipants : ${JSON.stringify(err)}`)
  }
}

module.exports.computeStats = async () => {
  const statsPoint = await getOnlineParticipantStats()
  db.insertStatsPoint(statsPoint)
}
