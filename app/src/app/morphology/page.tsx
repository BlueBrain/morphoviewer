import { MorphoViewer } from "@/MorphoViewer"
import { NeuroMorphoViz } from "@/components/NeuroMorphoViz"
import React from "react"

const FILE = "./GolgiCell.swc"
// const FILE = "./test-2.swc"

export default function PageMorphology() {
    const [swc, setSwc] = React.useState("")
    React.useEffect(() => {
        const action = async () => {
            const response = await fetch(FILE)
            const content = await response.text()
            console.log(content)
            setSwc(content)
        }
        void action()
    }, [])
    if (!swc) {
        return (
            <div
                style={{
                    display: "grid",
                    placeItems: "center",
                }}
            >
                <h1>Loading SWC file...</h1>
            </div>
        )
    }
    return (
        <div>
            <NeuroMorphoViz swc={swc} />
            <MorphoViewer swc={swc} />
            <p>
                Quo tenetur sed nam optio quidem. Qui asperiores nesciunt
                soluta. Est tenetur dignissimos ut dolore ipsam.
            </p>
            <p>
                Architecto saepe sed sit ipsam et est blanditiis. Vel expedita
                est non dolores ea minima esse. Illo fuga a iusto harum quos
                nesciunt omnis.
            </p>
            <p>
                Qui qui voluptatem modi. Optio fugiat et quia autem praesentium
                qui enim autem. Est exercitationem et nihil omnis ut molestiae
                cupiditate nesciunt.
            </p>
            <p>
                Voluptatem mollitia omnis itaque ullam aut. Eos id nesciunt aut
                reiciendis ut modi voluptas. Tenetur sit fugiat omnis distinctio
                est a non sint. Fugit rerum laborum exercitationem. Velit
                eligendi accusamus aliquam fuga expedita. Nihil consequuntur et
                corrupti possimus ullam quibusdam fugit.
            </p>
            <p>
                Harum qui molestiae qui vel. Iste sit officia fugit sed
                deserunt. Aut voluptates tempora fuga et corporis ab recusandae
                vel. Et ut esse nihil error sit. Voluptate excepturi ipsa sit
                cum voluptas vitae. Delectus quidem id voluptates.
            </p>
            <p>
                Vero similique ea ipsa facilis vel. Amet ea qui culpa. Nemo
                consequatur sunt rem possimus. Voluptatem est culpa quam quis
                facere ullam sint perferendis.
            </p>
            <p>
                Minima magnam aliquam nostrum aut ut quas dolorum. Et eveniet
                ducimus porro ducimus aspernatur officia. Sed sint nihil velit.
            </p>
            <p>
                Provident qui id qui est autem et error eius. Quisquam
                voluptatum quis voluptas vel. Voluptas incidunt aliquid et
                cumque. Praesentium at distinctio assumenda ut eligendi non in.
            </p>
            <p>
                Et necessitatibus sit sit sit nobis animi quibusdam. Voluptatem
                assumenda quaerat iste aliquid et. Culpa quod nulla mollitia
                quasi. Facilis vero magnam sapiente.
            </p>
            <p>
                Omnis ex non fuga possimus fugiat quo. Vitae aliquam cumque
                quisquam. Asperiores a voluptatem nulla repellendus eveniet at
                et ut. Odio vel eveniet inventore ipsa alias neque illo.
            </p>
        </div>
    )
}
