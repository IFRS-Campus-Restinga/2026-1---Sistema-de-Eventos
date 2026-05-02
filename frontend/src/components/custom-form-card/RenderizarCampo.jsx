import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/esm/Button';
import { Link } from 'react-router-dom';
import CampoDatalist from './CampoDatalist';
import CampoFase from './CampoFase';
import CampoEquipe from './CampoEquipe';
import eArray from '../../utils/eArray';

export default function RenderizarCampo({
    id,
    campo,
    erro,
    obterValor,
    setValores,
    aoAlterar,
    estadoDatalist,
    estadoFase,
    corTexto,
}) {
    const temErro = eArray(erro) && erro.length > 0;
    const desativado = !!campo?.desativado;
    const obrigatorio = !!campo?.obrigatorio;

    function atualizarValor(valor) {
        setValores((anterior) => ({ ...anterior, [id]: valor }));
        aoAlterar(valor, id, campo);
    }

    const valorAtual = obterValor(id, campo);
    const tipoCampo = String(campo?.tipo || '').toLocaleLowerCase();

    if (tipoCampo === 'text' || tipoCampo === 'texto') {
        return (
            <>
                <Form.Control
                    type="text"
                    placeholder={
                        campo?.placeholder ||
                        `Informe ${campo?.titulo || 'o campo'}`
                    }
                    value={valorAtual ?? ''}
                    onChange={(e) => atualizarValor(e.target.value)}
                    className="py-3"
                    disabled={desativado}
                    required={obrigatorio}
                    isInvalid={temErro}
                    id={id}
                />
                {temErro && (
                    <Form.Control.Feedback type="invalid">
                        {erro.join(', ')}
                    </Form.Control.Feedback>
                )}
            </>
        );
    }

    if (
        tipoCampo === 'textarea' ||
        tipoCampo === 'area de texto' ||
        tipoCampo === 'área de texto'
    ) {
        return (
            <>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={
                        campo?.placeholder ||
                        `Informe ${campo?.titulo || 'o campo'}`
                    }
                    value={valorAtual ?? ''}
                    onChange={(e) => atualizarValor(e.target.value)}
                    className="py-3"
                    disabled={desativado}
                    required={obrigatorio}
                    isInvalid={temErro}
                    id={id}
                />
                {temErro && (
                    <Form.Control.Feedback type="invalid">
                        {erro.join(', ')}
                    </Form.Control.Feedback>
                )}
            </>
        );
    }

    if (
        tipoCampo === 'switch' ||
        tipoCampo === 'boolean' ||
        tipoCampo === 'booleano'
    ) {
        return (
            <>
                <Form.Check
                    type="switch"
                    checked={!!valorAtual}
                    onChange={(e) => atualizarValor(e.target.checked)}
                    id={id}
                    required={obrigatorio}
                    isInvalid={temErro}
                    disabled={desativado}
                />
                {temErro && (
                    <div className="invalid-feedback d-block">
                        {erro.join(', ')}
                    </div>
                )}
            </>
        );
    }

    if (tipoCampo === 'date' || tipoCampo === 'data') {
        return (
            <>
                <Form.Control
                    type="date"
                    value={valorAtual ?? ''}
                    onChange={(e) => atualizarValor(e.target.value)}
                    className="py-3"
                    disabled={desativado}
                    required={obrigatorio}
                    isInvalid={temErro}
                    id={id}
                />
                {temErro && (
                    <Form.Control.Feedback type="invalid">
                        {erro.join(', ')}
                    </Form.Control.Feedback>
                )}
            </>
        );
    }

    if (
        tipoCampo === 'number' ||
        tipoCampo === 'numero' ||
        tipoCampo === 'número'
    ) {
        return (
            <>
                <Form.Control
                    type="number"
                    max={campo?.max || 10000}
                    min={campo?.min || 0}
                    placeholder={
                        campo?.placeholder ||
                        `Informe ${campo?.titulo || 'o campo'}`
                    }
                    value={valorAtual ?? ''}
                    onChange={(e) => {
                        const bruto = e.target.value;
                        atualizarValor(bruto === '' ? '' : Number(bruto));
                    }}
                    className="py-3"
                    disabled={desativado}
                    required={obrigatorio}
                    isInvalid={temErro}
                    id={id}
                />
                {temErro && (
                    <Form.Control.Feedback type="invalid">
                        {erro.join(', ')}
                    </Form.Control.Feedback>
                )}
            </>
        );
    }

    if (
        tipoCampo === 'select' ||
        tipoCampo === 'selecao' ||
        tipoCampo === 'seleção'
    ) {
        return (
            <>
                <Form.Select
                    value={valorAtual ?? '#'}
                    className="py-3"
                    disabled={desativado}
                    required={obrigatorio}
                    isInvalid={temErro}
                    id={id}
                    onChange={(e) => atualizarValor(e.target.value)}
                >
                    {(campo?.opcoes || []).map((opcao, i) => (
                        <option
                            key={i}
                            value={opcao.value}
                            disabled={opcao?.disabled}
                        >
                            {opcao.text}
                        </option>
                    ))}
                </Form.Select>
                {temErro && (
                    <Form.Control.Feedback
                        type="invalid"
                        style={{ display: 'block' }}
                    >
                        {erro.join(', ')}
                    </Form.Control.Feedback>
                )}
            </>
        );
    }

    if (
        tipoCampo === 'button link' ||
        tipoCampo === 'botao link' ||
        tipoCampo === 'botão link'
    ) {
        return (
            <Button
                variant={campo?.variant}
                className="border-0 mt-2 text-decoration-none text-white"
                disabled={desativado}
                style={{ background: campo?.background }}
                as={Link}
                to={campo?.to}
            >
                {campo?.text}
            </Button>
        );
    }

    if (tipoCampo === 'file' || tipoCampo === 'arquivo') {
        return (
            <Form.Control
                type="file"
                placeholder={
                    campo?.placeholder || `Envie ${campo?.titulo || 'arquivos'}`
                }
                onChange={(e) =>
                    !desativado &&
                    atualizarValor(e.target.files && e.target.files[0])
                }
                className="py-3"
                disabled={desativado}
                required={obrigatorio}
                id={id}
            />
        );
    }

    if (tipoCampo === 'datalist') {
        return (
            <CampoDatalist
                id={id}
                campo={campo}
                erro={erro}
                selecoes={estadoDatalist.selecoes}
                setSelecoes={estadoDatalist.setSelecoes}
                entradasDatalist={estadoDatalist.entradasDatalist}
                setEntradasDatalist={estadoDatalist.setEntradasDatalist}
                mostrarDatalist={estadoDatalist.mostrarDatalist}
                setMostrarDatalist={estadoDatalist.setMostrarDatalist}
                onChange={atualizarValor}
                desativado={desativado}
            />
        );
    }

    if (tipoCampo === 'fase' || tipoCampo === 'etapa') {
        return (
            <CampoFase
                id={id}
                campo={campo}
                fases={estadoFase.fases}
                setFases={estadoFase.setFases}
                mostrarOpcoes={estadoFase.mostrarOpcoes}
                setMostrarOpcoes={estadoFase.setMostrarOpcoes}
                desativado={desativado}
            />
        );
    }

    if (tipoCampo === 'equipe') {
        return (
            <CampoEquipe
                id={id}
                campo={campo}
                erro={erro}
                valor={valorAtual}
                onChange={atualizarValor}
                desativado={desativado}
                corTexto={corTexto}
            />
        );
    }

    return null;
}
