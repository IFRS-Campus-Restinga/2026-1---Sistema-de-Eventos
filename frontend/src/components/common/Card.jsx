export default function Card({
    corBorda = '#016B3F',
    children,
    largura,
    altura,
}) {
    return (
        <>
            <div
                className="bg-white pb-4"
                style={{
                    width: largura || '100%',
                    height: altura || 'auto',
                    minHeight: 200,
                    boxShadow:
                        '0px 4px 4px rgba(0, 0, 0, 0.25), 0px 1px 1px rgba(0, 0, 0, 0.25) inset',
                    borderRadius: 18,
                    borderLeft: `11px ${corBorda} solid`,
                }}
            >
                {children}
            </div>
        </>
    );
}
