export default function Page() {
    return (
        <iframe
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                border: "none",
            }}
            src="./docs/"
        ></iframe>
    )
}
