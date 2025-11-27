const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TravelFund", function () {
  let travelFund;
  let creator, friend1, friend2, friend3, friend4, hotel;
  const TRIP_NAME = "Viaje a Cancun 2025";
  const APPROVAL_PERCENTAGE = 60; // 60%
  const MINIMUM_VOTES = 2;

  beforeEach(async function () {
    [creator, friend1, friend2, friend3, friend4, hotel] = await ethers.getSigners();

    const TravelFund = await ethers.getContractFactory("TravelFund");
    travelFund = await TravelFund.deploy(TRIP_NAME, APPROVAL_PERCENTAGE, MINIMUM_VOTES);
    await travelFund.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Debe establecer el nombre del viaje correctamente", async function () {
      expect(await travelFund.tripName()).to.equal(TRIP_NAME);
    });

    it("Debe establecer el creador correctamente", async function () {
      expect(await travelFund.creator()).to.equal(creator.address);
    });

    it("Debe establecer el porcentaje de aprobación", async function () {
      expect(await travelFund.approvalPercentage()).to.equal(APPROVAL_PERCENTAGE);
    });

    it("Debe establecer el mínimo de votos", async function () {
      expect(await travelFund.minimumVotes()).to.equal(MINIMUM_VOTES);
    });

    it("El fondo debe estar activo inicialmente", async function () {
      expect(await travelFund.fundActive()).to.equal(true);
    });

    it("Debe rechazar porcentajes inválidos", async function () {
      const TravelFund = await ethers.getContractFactory("TravelFund");
      await expect(
        TravelFund.deploy("Viaje", 0, 1)
      ).to.be.revertedWith("Porcentaje debe estar entre 1 y 100");
      
      await expect(
        TravelFund.deploy("Viaje", 101, 1)
      ).to.be.revertedWith("Porcentaje debe estar entre 1 y 100");
    });
  });

  describe("Depósitos", function () {
    it("Debe permitir depositar ETH", async function () {
      const depositAmount = ethers.parseEther("1");
      
      await expect(travelFund.connect(friend1).deposit({ value: depositAmount }))
        .to.emit(travelFund, "ContributionReceived")
        .withArgs(friend1.address, depositAmount, depositAmount);
      
      expect(await travelFund.contributions(friend1.address)).to.equal(depositAmount);
      expect(await travelFund.totalContributions()).to.equal(depositAmount);
    });

    it("Debe agregar al contribuyente a la lista", async function () {
      await travelFund.connect(friend1).deposit({ value: ethers.parseEther("1") });
      
      expect(await travelFund.isContributor(friend1.address)).to.equal(true);
      expect(await travelFund.getContributorCount()).to.equal(1);
    });

    it("Debe acumular múltiples depósitos del mismo contribuyente", async function () {
      const amount1 = ethers.parseEther("1");
      const amount2 = ethers.parseEther("0.5");
      
      await travelFund.connect(friend1).deposit({ value: amount1 });
      await travelFund.connect(friend1).deposit({ value: amount2 });
      
      expect(await travelFund.contributions(friend1.address)).to.equal(amount1 + amount2);
      expect(await travelFund.getContributorCount()).to.equal(1);
    });

    it("Debe rechazar depósitos de 0 ETH", async function () {
      await expect(
        travelFund.connect(friend1).deposit({ value: 0 })
      ).to.be.revertedWith("Debes enviar ETH");
    });

    it("Debe permitir depósitos directos via receive()", async function () {
      const depositAmount = ethers.parseEther("1");
      
      await expect(
        friend1.sendTransaction({ to: await travelFund.getAddress(), value: depositAmount })
      ).to.emit(travelFund, "ContributionReceived");
      
      expect(await travelFund.contributions(friend1.address)).to.equal(depositAmount);
    });

    it("Debe tracking correcto con múltiples contribuyentes", async function () {
      await travelFund.connect(friend1).deposit({ value: ethers.parseEther("2") });
      await travelFund.connect(friend2).deposit({ value: ethers.parseEther("1.5") });
      await travelFund.connect(friend3).deposit({ value: ethers.parseEther("3") });
      
      expect(await travelFund.getContributorCount()).to.equal(3);
      expect(await travelFund.totalContributions()).to.equal(ethers.parseEther("6.5"));
    });
  });

  describe("Creación de Propuestas", function () {
    beforeEach(async function () {
      // Depositar fondos
      await travelFund.connect(friend1).deposit({ value: ethers.parseEther("5") });
      await travelFund.connect(friend2).deposit({ value: ethers.parseEther("5") });
    });

    it("Debe permitir a un contribuyente crear una propuesta", async function () {
      const amount = ethers.parseEther("2");
      const description = "Hotel en Cancun - 2 noches";
      
      await expect(
        travelFund.connect(friend1).createProposal(hotel.address, amount, description)
      ).to.emit(travelFund, "ProposalCreated")
       .withArgs(1, friend1.address, amount, description);
      
      expect(await travelFund.proposalCount()).to.equal(1);
    });

    it("Debe almacenar correctamente los datos de la propuesta", async function () {
      const amount = ethers.parseEther("2");
      const description = "Hotel en Cancun";
      
      await travelFund.connect(friend1).createProposal(hotel.address, amount, description);
      
      const proposal = await travelFund.getProposal(1);
      expect(proposal.id).to.equal(1);
      expect(proposal.proposer).to.equal(friend1.address);
      expect(proposal.recipient).to.equal(hotel.address);
      expect(proposal.amount).to.equal(amount);
      expect(proposal.description).to.equal(description);
      expect(proposal.executed).to.equal(false);
      expect(proposal.approved).to.equal(false);
    });

    it("No debe permitir a no-contribuyentes crear propuestas", async function () {
      await expect(
        travelFund.connect(friend3).createProposal(
          hotel.address,
          ethers.parseEther("1"),
          "Test"
        )
      ).to.be.revertedWith("No eres contribuyente del fondo");
    });

    it("Debe rechazar propuestas con monto mayor al balance", async function () {
      await expect(
        travelFund.connect(friend1).createProposal(
          hotel.address,
          ethers.parseEther("20"),
          "Gasto excesivo"
        )
      ).to.be.revertedWith("Fondos insuficientes");
    });

    it("Debe rechazar propuestas sin descripción", async function () {
      await expect(
        travelFund.connect(friend1).createProposal(
          hotel.address,
          ethers.parseEther("1"),
          ""
        )
      ).to.be.revertedWith("Debe incluir descripcion");
    });

    it("Debe rechazar propuestas con destinatario inválido", async function () {
      await expect(
        travelFund.connect(friend1).createProposal(
          ethers.ZeroAddress,
          ethers.parseEther("1"),
          "Test"
        )
      ).to.be.revertedWith("Destinatario invalido");
    });
  });

  describe("Votación", function () {
    beforeEach(async function () {
      // Depositar y crear propuesta
      await travelFund.connect(friend1).deposit({ value: ethers.parseEther("3") });
      await travelFund.connect(friend2).deposit({ value: ethers.parseEther("3") });
      await travelFund.connect(friend3).deposit({ value: ethers.parseEther("2") });
      
      await travelFund.connect(friend1).createProposal(
        hotel.address,
        ethers.parseEther("2"),
        "Hotel"
      );
    });

    it("Debe permitir votar a favor", async function () {
      await expect(travelFund.connect(friend1).vote(1, true))
        .to.emit(travelFund, "VoteCast")
        .withArgs(1, friend1.address, true);
      
      const proposal = await travelFund.getProposal(1);
      expect(proposal.votesFor).to.equal(1);
    });

    it("Debe permitir votar en contra", async function () {
      await travelFund.connect(friend1).vote(1, false);
      
      const proposal = await travelFund.getProposal(1);
      expect(proposal.votesAgainst).to.equal(1);
    });

    it("No debe permitir votar dos veces", async function () {
      await travelFund.connect(friend1).vote(1, true);
      
      await expect(
        travelFund.connect(friend1).vote(1, true)
      ).to.be.revertedWith("Ya votaste en esta propuesta");
    });

    it("Debe aprobar propuesta cuando se alcanza el umbral", async function () {
      // 3 contribuyentes, necesitan 60% = 2 votos
      await travelFund.connect(friend1).vote(1, true);
      
      await expect(travelFund.connect(friend2).vote(1, true))
        .to.emit(travelFund, "ProposalApproved")
        .withArgs(1);
      
      const proposal = await travelFund.getProposal(1);
      expect(proposal.approved).to.equal(true);
    });

    it("No debe aprobar si no hay votos suficientes", async function () {
      await travelFund.connect(friend1).vote(1, true);
      
      const proposal = await travelFund.getProposal(1);
      expect(proposal.approved).to.equal(false);
    });

    it("No debe permitir votar a no-contribuyentes", async function () {
      await expect(
        travelFund.connect(friend4).vote(1, true)
      ).to.be.revertedWith("No eres contribuyente del fondo");
    });

    it("Debe calcular votos necesarios correctamente", async function () {
      expect(await travelFund.votesNeededForApproval(1)).to.equal(2);
      
      await travelFund.connect(friend1).vote(1, true);
      expect(await travelFund.votesNeededForApproval(1)).to.equal(1);
      
      await travelFund.connect(friend2).vote(1, true);
      expect(await travelFund.votesNeededForApproval(1)).to.equal(0);
    });
  });

  describe("Ejecución de Propuestas", function () {
    beforeEach(async function () {
      await travelFund.connect(friend1).deposit({ value: ethers.parseEther("5") });
      await travelFund.connect(friend2).deposit({ value: ethers.parseEther("5") });
      await travelFund.connect(friend3).deposit({ value: ethers.parseEther("5") });
      
      await travelFund.connect(friend1).createProposal(
        hotel.address,
        ethers.parseEther("3"),
        "Pago de Hotel"
      );
    });

    it("Debe ejecutar propuesta aprobada correctamente", async function () {
      // Aprobar (60% de 3 = 2 votos)
      await travelFund.connect(friend1).vote(1, true);
      await travelFund.connect(friend2).vote(1, true);
      
      const initialBalance = await ethers.provider.getBalance(hotel.address);
      
      await expect(travelFund.connect(friend1).executeProposal(1))
        .to.emit(travelFund, "ProposalExecuted")
        .withArgs(1, hotel.address, ethers.parseEther("3"));
      
      const finalBalance = await ethers.provider.getBalance(hotel.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("3"));
      
      const proposal = await travelFund.getProposal(1);
      expect(proposal.executed).to.equal(true);
    });

    it("No debe ejecutar propuesta no aprobada", async function () {
      await expect(
        travelFund.connect(friend1).executeProposal(1)
      ).to.be.revertedWith("Propuesta no esta aprobada");
    });

    it("No debe ejecutar propuesta ya ejecutada", async function () {
      await travelFund.connect(friend1).vote(1, true);
      await travelFund.connect(friend2).vote(1, true);
      await travelFund.connect(friend1).executeProposal(1);
      
      await expect(
        travelFund.connect(friend1).executeProposal(1)
      ).to.be.revertedWith("Propuesta ya ejecutada");
    });
  });

  describe("Cierre del Fondo y Retiros", function () {
    beforeEach(async function () {
      await travelFund.connect(friend1).deposit({ value: ethers.parseEther("4") });
      await travelFund.connect(friend2).deposit({ value: ethers.parseEther("2") });
      await travelFund.connect(friend3).deposit({ value: ethers.parseEther("3") });
    });

    it("Solo el creador debe poder cerrar el fondo", async function () {
      await expect(
        travelFund.connect(friend1).closeFund()
      ).to.be.revertedWith("Solo el creador puede ejecutar esto");
      
      await expect(travelFund.connect(creator).closeFund())
        .to.emit(travelFund, "FundClosed");
    });

    it("Debe calcular la parte proporcional correctamente", async function () {
      // Total: 9 ETH
      // Friend1: 4 ETH (44.44%)
      const myShare = await travelFund.connect(friend1).getMyProportionalShare();
      expect(myShare).to.equal(ethers.parseEther("4"));
    });

    it("Debe permitir retiros proporcionales después de cerrar", async function () {
      await travelFund.connect(creator).closeFund();
      
      const initialBalance = await ethers.provider.getBalance(friend1.address);
      const expectedRefund = ethers.parseEther("4");
      
      const tx = await travelFund.connect(friend1).withdrawProportional();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const finalBalance = await ethers.provider.getBalance(friend1.address);
      expect(finalBalance - initialBalance + gasUsed).to.be.closeTo(
        expectedRefund,
        ethers.parseEther("0.001")
      );
    });

    it("No debe permitir retiros si el fondo está activo", async function () {
      await expect(
        travelFund.connect(friend1).withdrawProportional()
      ).to.be.revertedWith("El fondo aun esta activo");
    });

    it("No debe permitir retiros duplicados", async function () {
      await travelFund.connect(creator).closeFund();
      await travelFund.connect(friend1).withdrawProportional();
      
      await expect(
        travelFund.connect(friend1).withdrawProportional()
      ).to.be.revertedWith("Ya retiraste tus fondos");
    });

    it("Debe calcular proporciones después de gastar fondos", async function () {
      // Crear y aprobar propuesta
      await travelFund.connect(friend1).createProposal(
        hotel.address,
        ethers.parseEther("3"),
        "Hotel"
      );
      await travelFund.connect(friend1).vote(1, true);
      await travelFund.connect(friend2).vote(1, true);
      await travelFund.connect(friend1).executeProposal(1);
      
      // Quedan 6 ETH
      // Friend1 aportó 4 de 9 = 44.44% de 6 = 2.666... ETH
      await travelFund.connect(creator).closeFund();
      
      const share = await travelFund.connect(friend1).getMyProportionalShare();
      expect(share).to.be.closeTo(
        ethers.parseEther("2.666666666666666666"),
        ethers.parseEther("0.001")
      );
    });
  });

  describe("Funciones de Consulta", function () {
    beforeEach(async function () {
      await travelFund.connect(friend1).deposit({ value: ethers.parseEther("2") });
      await travelFund.connect(friend2).deposit({ value: ethers.parseEther("3") });
    });

    it("Debe devolver el balance correcto", async function () {
      expect(await travelFund.getBalance()).to.equal(ethers.parseEther("5"));
    });

    it("Debe devolver la lista de contribuyentes", async function () {
      const contributors = await travelFund.getContributors();
      expect(contributors.length).to.equal(2);
      expect(contributors[0]).to.equal(friend1.address);
      expect(contributors[1]).to.equal(friend2.address);
    });

    it("Debe verificar si alguien votó", async function () {
      await travelFund.connect(friend1).createProposal(
        hotel.address,
        ethers.parseEther("1"),
        "Test"
      );
      
      expect(await travelFund.hasVoted(1, friend1.address)).to.equal(false);
      
      await travelFund.connect(friend1).vote(1, true);
      
      expect(await travelFund.hasVoted(1, friend1.address)).to.equal(true);
    });
  });

  describe("Escenario Completo", function () {
    it("Flujo completo de viaje exitoso", async function () {
      // 1. Cuatro amigos depositan para el viaje
      await travelFund.connect(friend1).deposit({ value: ethers.parseEther("5") });
      await travelFund.connect(friend2).deposit({ value: ethers.parseEther("4") });
      await travelFund.connect(friend3).deposit({ value: ethers.parseEther("3") });
      await travelFund.connect(friend4).deposit({ value: ethers.parseEther("3") });
      
      expect(await travelFund.getBalance()).to.equal(ethers.parseEther("15"));
      
      // 2. Friend1 propone pagar el hotel
      await travelFund.connect(friend1).createProposal(
        hotel.address,
        ethers.parseEther("6"),
        "Hotel Cancun - 3 noches"
      );
      
      // 3. Tres amigos votan a favor (75% > 60%)
      await travelFund.connect(friend1).vote(1, true);
      await travelFund.connect(friend2).vote(1, true);
      await travelFund.connect(friend3).vote(1, true);
      
      // 4. Ejecutar el pago
      await travelFund.executeProposal(1);
      
      expect(await travelFund.getBalance()).to.equal(ethers.parseEther("9"));
      
      // 5. Crear segunda propuesta para tours
      await travelFund.connect(friend2).createProposal(
        friend2.address,
        ethers.parseEther("4"),
        "Tours y actividades"
      );
      
      // 6. Aprobar y ejecutar
      await travelFund.connect(friend1).vote(2, true);
      await travelFund.connect(friend3).vote(2, true);
      await travelFund.connect(friend4).vote(2, true);
      await travelFund.executeProposal(2);
      
      expect(await travelFund.getBalance()).to.equal(ethers.parseEther("5"));
      
      // 7. Cerrar fondo y dividir lo que sobra
      await travelFund.connect(creator).closeFund();
      
      // Cada uno puede retirar su parte proporcional
      await travelFund.connect(friend1).withdrawProportional();
      await travelFund.connect(friend2).withdrawProportional();
      await travelFund.connect(friend3).withdrawProportional();
      await travelFund.connect(friend4).withdrawProportional();
      
      // El contrato queda casi vacío (puede haber residuos de wei)
      const remaining = await travelFund.getBalance();
      expect(remaining).to.be.lessThan(ethers.parseEther("0.001"));
    });
  });
});
