import { ApolloServer } from 'apollo-server'
import muuid from 'uuid-mongodb'
import { jest } from '@jest/globals'
import { queryAPI, setUpServer } from '../utils/testUtils.js'
import { muuidToString } from '../utils/helpers.js'
import { TickInput } from '../db/TickTypes.js'

jest.setTimeout(60000)

describe('ticks API', () => {
  let server: ApolloServer
  let user: muuid.MUUID
  let userUuid: string
  let inMemoryDB

  // Mongoose models for mocking pre-existing state.
  let tickOne: TickInput

  beforeAll(async () => {
    ({ server, inMemoryDB } = await setUpServer())
    // Auth0 serializes uuids in "relaxed" mode, resulting in this hex string format
    // "59f1d95a-627d-4b8c-91b9-389c7424cb54" instead of base64 "WfHZWmJ9S4yRuTicdCTLVA==".
    user = muuid.mode('relaxed').v4()
    userUuid = muuidToString(user)

    tickOne = {
      name: 'Route One',
      notes: 'Nice slab',
      climbId: 'c76d2083-6b8f-524a-8fb8-76e1dc79833f',
      userId: userUuid,
      style: 'Lead',
      attemptType: 'Onsight',
      dateClimbed: new Date('2016-07-20T17:30:15+05:30'),
      grade: '5.8',
      source: 'MP'
    }
  })

  beforeEach(async () => {
    await inMemoryDB.clear()
  })

  afterAll(async () => {
    await server.stop()
    await inMemoryDB.close()
  })

  describe('mutations', () => {
    const createQuery = `
      mutation ($input: Tick!) {
        tick: addTick(input: $input) {
          _id
          name
          notes
          climbId
          userId
          style
          attemptType
          dateClimbed
          grade
          source
        }
      }
    `
    const updateQuery = `
      mutation ($input: TickFilter!) {
        tick: editTick(input: $input) {
          _id
          name
          notes
          climbId
          userId
          style
          attemptType
          dateClimbed
          grade
          source
        }
      }
    `
    it('creates and updates a tick', async () => {
      const createResponse = await queryAPI({
        query: createQuery,
        variables: { input: tickOne },
        userUuid,
        roles: ['user_admin']
      })

      expect(createResponse.statusCode).toBe(200)
      const createTickRes = createResponse.body.data.tick
      expect(createTickRes.name).toBe(tickOne.name)
      expect(createTickRes.notes).toBe(tickOne.notes)
      expect(createTickRes.climbId).toBe(tickOne.climbId)
      expect(createTickRes.userId).toBe(tickOne.userId)
      expect(createTickRes.style).toBe(tickOne.style)
      expect(createTickRes.attemptType).toBe(tickOne.attemptType)
      expect(createTickRes.dateClimbed).toBe(new Date(tickOne.dateClimbed).getTime())
      expect(createTickRes.grade).toBe(tickOne.grade)
      expect(createTickRes.source).toBe(tickOne.source)
      expect(createTickRes._id).toBeTruthy()

      const updateResponse = await queryAPI({
        query: updateQuery,
        variables: {
          input: {
            _id: createTickRes._id,
            updatedTick: {
              name: 'Updated Route One',
              climbId: 'new climb id',
              userId: userUuid,
              dateClimbed: '2022-11-10',
              grade: 'new grade',
              source: 'OB'
            }
          }
        },
        userUuid,
        roles: ['user_admin']
      })

      expect(updateResponse.statusCode).toBe(200)
      expect(updateResponse.body.data.tick.name).toBe('Updated Route One')
    })
  })
})
