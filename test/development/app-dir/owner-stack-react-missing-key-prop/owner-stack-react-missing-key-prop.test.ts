import { nextTestSetup } from 'e2e-utils'
import {
  getRedboxSource,
  openRedbox,
  getStackFramesContent,
} from 'next-test-utils'

// TODO: When owner stack is enabled by default, remove the condition and only keep one test
const isOwnerStackEnabled =
  process.env.TEST_OWNER_STACK !== 'false' ||
  process.env.__NEXT_EXPERIMENTAL_PPR === 'true'

;(isOwnerStackEnabled ? describe : describe.skip)(
  'app-dir - owner-stack-react-missing-key-prop',
  () => {
    const { next } = nextTestSetup({
      files: __dirname,
    })

    it('should catch invalid element from on rsc component', async () => {
      const browser = await next.browser('/rsc')
      await openRedbox(browser)

      const stackFramesContent = await getStackFramesContent(browser)
      const source = await getRedboxSource(browser)

      if (process.env.TURBOPACK) {
        expect(stackFramesContent).toMatchInlineSnapshot(
          `"at Page (app/rsc/page.tsx (6:13))"`
        )
        expect(source).toMatchInlineSnapshot(`
        "app/rsc/page.tsx (7:10) @ <anonymous>

           5 |     <div>
           6 |       {list.map((item, index) => (
        >  7 |         <span>{item}</span>
             |          ^
           8 |       ))}
           9 |     </div>
          10 |   )"
      `)
      } else {
        // FIXME: the owner stack method names should be `Page` instead of `map`
        expect(stackFramesContent).toMatchInlineSnapshot(
          `"at map (app/rsc/page.tsx (6:13))"`
        )
        // FIXME: the methodName should be `@ <anonymous>` instead of `@ span`
        expect(source).toMatchInlineSnapshot(`
        "app/rsc/page.tsx (7:10) @ span

           5 |     <div>
           6 |       {list.map((item, index) => (
        >  7 |         <span>{item}</span>
             |          ^
           8 |       ))}
           9 |     </div>
          10 |   )"
      `)
      }
    })

    it('should catch invalid element from on ssr client component', async () => {
      const browser = await next.browser('/ssr')
      await openRedbox(browser)

      const stackFramesContent = await getStackFramesContent(browser)
      const source = await getRedboxSource(browser)
      if (process.env.TURBOPACK) {
        expect(stackFramesContent).toMatchInlineSnapshot(
          `"at Page (app/ssr/page.tsx (8:13))"`
        )
        expect(source).toMatchInlineSnapshot(`
        "app/ssr/page.tsx (9:9) @ <unknown>

           7 |     <div>
           8 |       {list.map((item, index) => (
        >  9 |         <p>{item}</p>
             |         ^
          10 |       ))}
          11 |     </div>
          12 |   )"
      `)
      } else {
        // FIXME: the owner stack method names should be `Page` instead of `map`
        expect(stackFramesContent).toMatchInlineSnapshot(
          `"at map (app/ssr/page.tsx (8:13))"`
        )
        // FIXME: the methodName should be `@ <unknown>` instead of `@ p`
        expect(source).toMatchInlineSnapshot(`
        "app/ssr/page.tsx (9:10) @ p

           7 |     <div>
           8 |       {list.map((item, index) => (
        >  9 |         <p>{item}</p>
             |          ^
          10 |       ))}
          11 |     </div>
          12 |   )"
      `)
      }
    })
  }
)
