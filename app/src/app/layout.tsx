import Styles from "./layout.module.css"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className={Styles.main}>
            <header>
                <a href="#/">API Documentation</a>
                <a href="#/morphology">Morphology</a>
                <a href="#/atlas">Atlas</a>
            </header>
            <main>{children}</main>
        </div>
    )
}
