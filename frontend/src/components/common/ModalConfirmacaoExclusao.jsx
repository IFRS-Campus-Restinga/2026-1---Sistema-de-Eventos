import { Modal, Button } from 'react-bootstrap';
import { BsExclamationTriangle } from 'react-icons/bs';

export default function ModalConfirmacao({ show, handleClose, handleConfirm, titulo, mensagem }) {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="d-flex align-items-center gap-2">
                    <BsExclamationTriangle className="text-danger" />
                    {titulo || "Confirmar Exclusão"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {mensagem || "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."}
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={handleConfirm}>
                    Excluir
                </Button>
            </Modal.Footer>
        </Modal>
    );
}