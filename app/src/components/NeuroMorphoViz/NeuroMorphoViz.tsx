import React from "react"
import { classNames } from "@/util/utils"
import { InputText } from "@/components/InputText"

import styles from "./neuro-morpho-viz.module.css"

export interface NeuroMorphoVizProps {
    className?: string
    swc: string
}

export function NeuroMorphoViz({ className, swc }: NeuroMorphoVizProps) {
    const [server, setServer] = React.useState("http://localhost:8080/soma")
    const [token, setToken] = React.useState(
        "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI5T0R3Z1JSTFVsTTJHbFphVDZjVklnenJsb0lzUWJmbTBDck1icXNjNHQ4In0.eyJleHAiOjE3MTQ2NzAxNzcsImlhdCI6MTcxNDY0MjEzMywiYXV0aF90aW1lIjoxNzE0NjM0MTc3LCJqdGkiOiJjOTlkMzQ1Ny1iNTA0LTQ2YzItYjc4MS0zZWM1ZGM0Y2RhNjMiLCJpc3MiOiJodHRwczovL2JicGF1dGguZXBmbC5jaC9hdXRoL3JlYWxtcy9CQlAiLCJhdWQiOlsiaHR0cHM6Ly9zbGFjay5jb20iLCJjb3Jlc2VydmljZXMtZ2l0bGFiIiwiYWNjb3VudCJdLCJzdWIiOiJmOjBmZGFkZWY3LWIyYjktNDkyYi1hZjQ2LWM2NTQ5MmQ0NTljMjpwZXRpdGplYSIsInR5cCI6IkJlYXJlciIsImF6cCI6ImJicC1uaXNlLXN0YWdpbmctbmV4dXMtZnVzaW9uIiwibm9uY2UiOiIxNTVlZGZkMTczY2E0NjlkOTczNjI5MWMwOTM1NzRhNiIsInNlc3Npb25fc3RhdGUiOiJjZDRkZjBlZi1kNWZlLTQ1ZjEtODRkNS0zZGQzZmY3OTcwZWEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiYmJwLXBhbS1hdXRoZW50aWNhdGlvbiIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLWJicCJdfSwicmVzb3VyY2VfYWNjZXNzIjp7Imh0dHBzOi8vc2xhY2suY29tIjp7InJvbGVzIjpbInJlc3RyaWN0ZWQtYWNjZXNzIl19LCJjb3Jlc2VydmljZXMtZ2l0bGFiIjp7InJvbGVzIjpbInJlc3RyaWN0ZWQtYWNjZXNzIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBuZXh1cyBwcm9maWxlIGxvY2F0aW9uIGVtYWlsIiwic2lkIjoiY2Q0ZGYwZWYtZDVmZS00NWYxLTg0ZDUtM2RkM2ZmNzk3MGVhIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJGYWJpZW4gUGV0aXRqZWFuIiwibG9jYXRpb24iOiJCMSA0IDI2Ny4wNDAiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJwZXRpdGplYSIsImdpdmVuX25hbWUiOiJGYWJpZW4iLCJmYW1pbHlfbmFtZSI6IlBldGl0amVhbiIsImVtYWlsIjoiZmFiaWVuLnBldGl0amVhbkBlcGZsLmNoIn0.U3jJ8fcqmFsFLM7wxFeNFjF1LPYBuuNCy_clRFKzEMgfi4ACyh3WzA5O425iz2rAHMTwayla3y5polQWAuLuvid3yIA91DinTVHAQDWA1KkG6Gh2N9Kk71V-Oqzq7J_QHA8Vlr8qc6wn0Kr4ppq-cN1ZvHqlujPsrirbYcuMlOegBYPAh8-sVf3CLkbyrR1ckOow5fqGiTVxvGSjpGGB-NGK7D1NRpyakYJ6mu65vibCIpJgYV6jLGQCx_0fBcTUyl5H9XvPGuy9yBkiMG0e6trcX0cQOiMN7UwRJbD0qwwVjinz_l_aSYw2iAXqlYSAwzBtOyGSVilE4Yd1zJP03g"
    )
    const [fileId, setFileId] = React.useState(
        "https:%2F%2Fstaging.nise.bbp.epfl.ch%2Fnexus%2Fv1%2Fresources%2FVizTeam%2FTolokoban%2F_%2Fbc61f019-4451-4c7a-96f6-ddffc184c4cb"
    )
    const [orgLabel, setOrgLabel] = React.useState("VizTeam")
    const [projectLabel, setProjectLabel] = React.useState("Tolokoban")
    // const [fileId, setFileId] = React.useState(
    //     "https:%2F%2Fsandbox.bluebrainnexus.io%2Fv1%2Fresources%2Fgithub-users%2Fdanburonline%2F_%2F5e7ed6ca-923e-4654-bfc5-6f5f06ea3fce"
    // )
    // const [orgLabel, setOrgLabel] = React.useState("github-users")
    // const [projectLabel, setProjectLabel] = React.useState("danburonline")
    const [rev, setRev] = React.useState("1")
    const handleClick = async () => {
        const data = await queryNeuroMorphoVizSwc(server, swc)
        // const data = await queryNeuroMorphoVizSoma({
        //     server,
        //     token,
        //     fileId,
        //     orgLabel,
        //     projectLabel,
        //     rev,
        // })
        console.log("🚀 [NeuroMorphoViz] data = ", data) // @FIXME: Remove this line written on 2024-05-02 at 10:50
    }
    return (
        <div className={classNames(styles.main, className)}>
            <h1>NeuroMorphoViz</h1>
            <section>
                <InputText
                    label="Service address:"
                    value={server}
                    onChange={setServer}
                />
                <InputText label="Token:" value={token} onChange={setToken} />
                <InputText
                    label="TextId:"
                    value={fileId}
                    onChange={setFileId}
                />
                <InputText
                    label="orgLabel:"
                    value={orgLabel}
                    onChange={setOrgLabel}
                />
                <InputText
                    label="projectLabel:"
                    value={projectLabel}
                    onChange={setProjectLabel}
                />
                <InputText label="rev:" value={rev} onChange={setRev} />
                <button type="button" onClick={() => void handleClick()}>
                    Get Soma
                </button>
            </section>
            <p>
                You can get your token{" "}
                <a
                    href="https://staging.nise.bbp.epfl.ch/nexus"
                    target="_blank"
                >
                    here
                </a>
                . Click on your login name and select <b>Copy token</b>.
            </p>
        </div>
    )
}

async function queryNeuroMorphoVizSoma({
    server,
    token,
    fileId,
    orgLabel,
    projectLabel,
    rev,
}: {
    server: string
    token: string
    fileId: string
    orgLabel: string
    projectLabel: string
    rev: string
}) {
    const url = `${server}/process-soma`
    console.log("queryNeuroMorphoViz", url)
    const resp = await fetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        referrer: "no-referrer",
        body: JSON.stringify({
            org_label: orgLabel,
            project_label: projectLabel,
            file_id: fileId,
            rev,
        }),
    })
    if (!resp.ok) {
        const out = await resp.text()
        console.log("🚀 [NeuroMorphoViz] out = ", out) // @FIXME: Remove this line written on 2024-05-02 at 12:14
        throw Error(
            `Error #${resp.status} in process-soma endpoint: ${resp.statusText}!`
        )
    }
    return await resp.text()
}

async function queryNeuroMorphoVizSwc(server: string, swc: string) {
    const url = `${server}/process-swc`
    const data = new FormData()
    const blob = new Blob([swc], { type: "text/plain" })
    data.append("file", blob)
    console.log("queryNeuroMorphoVizSwc", url, swc)
    const resp = await fetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        // headers: {
        //     "Content-Type": "multipart/form-data",
        // },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        referrer: "no-referrer",
        body: data,
    })
    if (!resp.ok) {
        const out = await resp.text()
        console.log("🚀 [NeuroMorphoViz] out = ", out) // @FIXME: Remove this line written on 2024-05-02 at 12:14
        throw Error(
            `Error #${resp.status} in process-soma endpoint: ${resp.statusText}!`
        )
    }
    const respBlob = await resp.blob()
    const respUrl = URL.createObjectURL(respBlob)
    window.open(respUrl, "_blank")
}
