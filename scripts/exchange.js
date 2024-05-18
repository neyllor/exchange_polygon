const ethers = require('ethers');
const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const usdtArtifact = require('../artifacts/contracts/DREX.sol/DREX.json');
const wethArtifact = require('../artifacts/contracts/ERC20.sol/REAL.json');
const hre = require('hardhat');

// Endereço das moedas
const CONTRACT_ADDRESS = {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    WETH: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
    ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564'
}

//Função para capturar a instância do assinante.
async function getSigner(){
    return await hre.ethers.getSigner();
    
}

// Função para capturar e retornar a instância do contrato
function getContractInstace(address, artifact, signer){
    return new ethers.Contract(address, artifact, signer);
}

// Função para mostrar o swap no console
async function logBalances(provider, signer, contracts){
    const {usdt, weth} = contracts;
    const ethBalances = await provider.getBalances(signer.address);
    const usdtBalances = await usdt.balanceOf(signer.address);
    const wethBalances = await weth.balanceOf(signer.address);

    consolelog('--------------');
    consolelog('ETH Balance: ', ethers.formatEther(ethBalances));
    consolelog('USDT Balance: ', ethers.formatEther(usdtBalances));
    consolelog('WETH Balance: ', ethers.formatEther(wethBalances));
    consolelog('--------------');
}

// Função para realizar o swap
async function executeSwap(provider, signer, contracts, amountIn){
    const{ router, weth, usdt } = contracts;
    const nonce = await provider.getTransactionCount(signer.address, 'pending');

    //Enviando ETH para o contrato WETH 
    await signer.sendTrasaction({
        to: CONTRACT_ADDRESS.WETH,
        value: ethers.parseEther('5'),
        nonce: nonce,
    });

    await logBalances(provider, signer, contracts);

    //Aprovando a rota de swap  usdt para weth
    const tx1 = await usdt.approve(CONTRACT_ADDRESS.ROUTER, amountIn);
    await tx1.wait();

    // Realizando swap entre WETH e USDT
    const tx2 = await router.swapExactTokensForTokens(
        amountin, //Valor inicial
        0, // valor minimo de tokens 
        [CONTRACT_ADDRESS.WETH, CONTRACT_ADDRESS.USDT], // endereço dos tokens que serão trocados
        signer.address, // destinatário dos tokens de saída
        Math.floor(Date.now() / 1000) + (60*10), // deadline da ordem de troca (1 minuto)
        {
            gasLimit: 1000000,
        }
    );
    await tx2.wait();

    await logBalances(provider, signer, contracts);
}

async function main(){
    const signer = await getSigner();
    const provider = hre.ethers.provider;

    const contracts = {
        router: getContractInstace(CONTRACT_ADDRESS.ROUTER, routerArtifact, signer),
        usdt: getContractInstace(CONTRACT_ADDRESS.USDT, usdtArtifact, signer),
        weth: getContractInstace(CONTRACT_ADDRESS.WETH, wethArtifact, signer),
    };

    const amountIn = ethers.parseEther('1'); // Setando o valor de ETH que será transacionado
    await executeSwap(provider, signer, contracts, amountIn);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});