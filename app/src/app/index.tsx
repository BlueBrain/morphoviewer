/**
 * build-react-routes
 *
 * WARNING! this file has been generated automatically.
 * Please do not edit it because it will probably be overwritten.
 *
 * If you find a bug or if you need an improvement, please fill an issue:
 * https://github.com/tolokoban/build-react-routes/issues
 */

export * from "./routes"
export * from "./types"

import React from "react"

import { matchRoute, useRouteContext, ROUTES } from "./routes"
import { RouteMatch, RoutePath } from "./types"

import Layout0 from "./layout"
const Page0 = React.lazy(() => import("./page"))
const Page1 = React.lazy(() => import("./atlas/page"))
const Page2 = React.lazy(() => import("./morphology/page"))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function App({ lang }: { lang?: string }) {
    const context = useRouteContext()
    const fb = <div>Loading...</div>
    const ly0 = Layout0
    const pg0 = Page0
    const pg1 = Page1
    const pg2 = Page2
    return (
        <Route path="/" Page={pg0} Layout={ly0} fallback={fb} context={context}>
            <Route path="/atlas" Page={pg1} fallback={fb} context={context}/>
            <Route path="/morphology" Page={pg2} fallback={fb} context={context}/>
        </Route>
    )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function intl<T extends PageComponent | ContainerComponent | JSX.Element>(
    page: T,
    translations: Record<string, T>,
    lang = ""
): T {
    const candidate1 = translations[lang]
    if (candidate1) return candidate1

    const [prefix] = lang.split("-")
    const candidate2 = translations[prefix]
    if (candidate2) return candidate2

    return page
}

type PageComponent = React.FC<{ params: Record<string, string> }>
type ContainerComponent = React.FC<{
    children: React.ReactNode
    params: Record<string, string>
}>

interface RouteProps {
    path: string
    element?: JSX.Element
    fallback?: JSX.Element
    children?: React.ReactNode
    Page?: PageComponent
    Layout?: ContainerComponent
    Template?: ContainerComponent
    context: RouteMatch | null
    access?: (context: RouteMatch | null) => Promise<boolean>
}

function Route({
    path,
    fallback,
    children,
    Page,
    Layout,
    Template,
    access,
    context
}: RouteProps) {
    const [authorized, setAuthorized] = React.useState<boolean | undefined>(
        false
    )
    const m = context && matchRoute(context.path, ROUTES[path as RoutePath])
    React.useEffect(() => {
        if (!m) return

        if (!access) {
            setAuthorized(true)
        } else if (context) {
            setAuthorized(undefined)
            access(context)
                .then(setAuthorized)
                .catch(ex => {
                    console.error("Error in access() function:", ex)
                    setAuthorized(false)
                })

        }
    }, [access])

    if (!m) return null

    if (!authorized) return fallback

    if (m.distance === 0) {
        if (!Page) return null

        const element = Template ? (
            <Template params={m.params}>
                <Page params={m.params} />
            </Template>
        ) : (
            <Page params={m.params} />
        )
        if (Layout) {
            return (
                <Layout params={m.params}>
                    <React.Suspense fallback={fallback}>
                        {element}
                    </React.Suspense>
                </Layout>
            )
        }
        return <React.Suspense fallback={fallback}>{element}</React.Suspense>
    }
    return Layout ? (
        <Layout params={m.params}>{children}</Layout>
    ) : (
        <>{children}</>
    )
}
