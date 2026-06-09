import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default function ModalPopup({
    show = false,
    titulo = '',
    tituloSecundario = '',
    texto = '',
    textoFechar = 'Fechar',
    onFechar,
    textoAcao = '',
    onAcao,
    variante = 'danger',
    size = 'lg',
    scrollable = false,
    children,
}) {
    const variantes = { danger: 'danger', success: 'success' };

    if (!texto && variante == 'danger') {
        texto =
            'Essa ação é irreversível. Tem certeza que deseja proceder com a ação?';
    }

    return (
        <Modal
            show={show}
            size={size}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            scrollable={scrollable}
        >
            <Modal.Header closeButton onClick={onFechar}>
                <Modal.Title id="contained-modal-title-vcenter">
                    {titulo}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children ? (
                    children
                ) : (
                    <>
                        <h4>{tituloSecundario}</h4>
                        <p>{texto}</p>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                {textoFechar === '' ? null : (
                    <Button variant="secondary" onClick={onFechar}>
                        {textoFechar}
                    </Button>
                )}
                {textoAcao === '' ? null : (
                    <Button variant={variantes[variante]} onClick={onAcao}>
                        {textoAcao}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}
