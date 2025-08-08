const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('RealYieldInvoiceFactoring', function () {
  let invoiceFactoring;
  let insurancePool;
  let owner;
  let exporter;
  let investor;
  let addrs;

  beforeEach(async function () {
    // Get signers
    [owner, exporter, investor, ...addrs] = await ethers.getSigners();

    // Deploy InsurancePool
    const InsurancePool = await ethers.getContractFactory('InsurancePool');
    insurancePool = await InsurancePool.deploy();
    await insurancePool.deployed();

    // Deploy RealYieldInvoiceFactoring
    const RealYieldInvoiceFactoring = await ethers.getContractFactory('RealYieldInvoiceFactoring');
    invoiceFactoring = await RealYieldInvoiceFactoring.deploy(insurancePool.address);
    await invoiceFactoring.deployed();

    // Set up insurance pool
    await insurancePool.setFactoringContract(invoiceFactoring.address);
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await invoiceFactoring.owner()).to.equal(owner.address);
    });

    it('Should set the insurance pool address', async function () {
      expect(await invoiceFactoring.insurancePool()).to.equal(insurancePool.address);
    });

    it('Should initialize with zero invoices', async function () {
      expect(await invoiceFactoring.invoiceCounter()).to.equal(0);
    });
  });

  describe('Invoice Creation', function () {
    it('Should create a new invoice', async function () {
      const faceValue = ethers.utils.parseEther('1000');
      const tenor = 90; // 90 days
      const riskScore = 750; // 7.5%
      const metadata = 'QmTestHash123';

      await expect(
        invoiceFactoring.connect(exporter).createInvoice(
          faceValue,
          tenor,
          riskScore,
          metadata,
          { value: ethers.utils.parseEther('100') } // 10% collateral
        )
      ).to.emit(invoiceFactoring, 'InvoiceCreated');

      const invoice = await invoiceFactoring.invoices(1);
      expect(invoice.exporter).to.equal(exporter.address);
      expect(invoice.faceValue).to.equal(faceValue);
      expect(invoice.tenor).to.equal(tenor);
      expect(invoice.riskScore).to.equal(riskScore);
      expect(invoice.status).to.equal(0); // ACTIVE
    });

    it('Should require minimum collateral', async function () {
      const faceValue = ethers.utils.parseEther('1000');
      const tenor = 90;
      const riskScore = 750;
      const metadata = 'QmTestHash123';

      await expect(
        invoiceFactoring.connect(exporter).createInvoice(
          faceValue,
          tenor,
          riskScore,
          metadata,
          { value: ethers.utils.parseEther('50') } // Insufficient collateral
        )
      ).to.be.revertedWith('Insufficient collateral');
    });

    it('Should reject invalid risk scores', async function () {
      const faceValue = ethers.utils.parseEther('1000');
      const tenor = 90;
      const riskScore = 1100; // 11% - too high
      const metadata = 'QmTestHash123';

      await expect(
        invoiceFactoring.connect(exporter).createInvoice(
          faceValue,
          tenor,
          riskScore,
          metadata,
          { value: ethers.utils.parseEther('100') }
        )
      ).to.be.revertedWith('Risk score too high');
    });
  });

  describe('Invoice Investment', function () {
    beforeEach(async function () {
      // Create an invoice first
      const faceValue = ethers.utils.parseEther('1000');
      const tenor = 90;
      const riskScore = 750;
      const metadata = 'QmTestHash123';

      await invoiceFactoring.connect(exporter).createInvoice(
        faceValue,
        tenor,
        riskScore,
        metadata,
        { value: ethers.utils.parseEther('100') }
      );
    });

    it('Should allow investment in active invoice', async function () {
      const investmentAmount = ethers.utils.parseEther('500');

      await expect(
        invoiceFactoring.connect(investor).investInInvoice(1, {
          value: investmentAmount,
        })
      ).to.emit(invoiceFactoring, 'InvestmentMade');

      const invoice = await invoiceFactoring.invoices(1);
      expect(invoice.totalInvested).to.equal(investmentAmount);

      const investment = await invoiceFactoring.investments(investor.address, 1);
      expect(investment.amount).to.equal(investmentAmount);
    });

    it('Should not allow investment exceeding face value', async function () {
      const investmentAmount = ethers.utils.parseEther('1500'); // More than face value

      await expect(
        invoiceFactoring.connect(investor).investInInvoice(1, {
          value: investmentAmount,
        })
      ).to.be.revertedWith('Investment exceeds remaining amount');
    });

    it('Should calculate correct discount rate', async function () {
      const discountRate = await invoiceFactoring.calculateDiscountRate(750, 90);
      expect(discountRate).to.be.gt(0);
      expect(discountRate).to.be.lt(1000); // Less than 10%
    });
  });

  describe('Invoice Settlement', function () {
    beforeEach(async function () {
      // Create and invest in an invoice
      const faceValue = ethers.utils.parseEther('1000');
      const tenor = 90;
      const riskScore = 750;
      const metadata = 'QmTestHash123';

      await invoiceFactoring.connect(exporter).createInvoice(
        faceValue,
        tenor,
        riskScore,
        metadata,
        { value: ethers.utils.parseEther('100') }
      );

      await invoiceFactoring.connect(investor).investInInvoice(1, {
        value: ethers.utils.parseEther('500'),
      });
    });

    it('Should allow owner to settle invoice', async function () {
      await expect(invoiceFactoring.settleInvoice(1))
        .to.emit(invoiceFactoring, 'InvoiceSettled');

      const invoice = await invoiceFactoring.invoices(1);
      expect(invoice.status).to.equal(1); // SETTLED
    });

    it('Should not allow non-owner to settle', async function () {
      await expect(
        invoiceFactoring.connect(exporter).settleInvoice(1)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should allow investor to claim returns after settlement', async function () {
      await invoiceFactoring.settleInvoice(1);

      const initialBalance = await investor.getBalance();
      const tx = await invoiceFactoring.connect(investor).claimReturns(1);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const finalBalance = await investor.getBalance();

      expect(finalBalance.add(gasUsed)).to.be.gt(initialBalance);
    });
  });

  describe('Default Handling', function () {
    beforeEach(async function () {
      // Create and invest in an invoice
      const faceValue = ethers.utils.parseEther('1000');
      const tenor = 90;
      const riskScore = 750;
      const metadata = 'QmTestHash123';

      await invoiceFactoring.connect(exporter).createInvoice(
        faceValue,
        tenor,
        riskScore,
        metadata,
        { value: ethers.utils.parseEther('100') }
      );

      await invoiceFactoring.connect(investor).investInInvoice(1, {
        value: ethers.utils.parseEther('500'),
      });
    });

    it('Should handle invoice default', async function () {
      await expect(invoiceFactoring.defaultInvoice(1))
        .to.emit(invoiceFactoring, 'InvoiceDefaulted');

      const invoice = await invoiceFactoring.invoices(1);
      expect(invoice.status).to.equal(2); // DEFAULTED
    });

    it('Should allow insurance claim after default', async function () {
      await invoiceFactoring.defaultInvoice(1);

      // Fund insurance pool
      await insurancePool.deposit({ value: ethers.utils.parseEther('1000') });

      await expect(
        invoiceFactoring.connect(investor).claimInsurance(1)
      ).to.emit(insurancePool, 'InsuranceClaimed');
    });
  });

  describe('View Functions', function () {
    it('Should return correct invoice count', async function () {
      expect(await invoiceFactoring.getInvoiceCount()).to.equal(0);

      // Create an invoice
      await invoiceFactoring.connect(exporter).createInvoice(
        ethers.utils.parseEther('1000'),
        90,
        750,
        'QmTestHash123',
        { value: ethers.utils.parseEther('100') }
      );

      expect(await invoiceFactoring.getInvoiceCount()).to.equal(1);
    });

    it('Should return active invoices', async function () {
      // Create multiple invoices
      for (let i = 0; i < 3; i++) {
        await invoiceFactoring.connect(exporter).createInvoice(
          ethers.utils.parseEther('1000'),
          90,
          750,
          `QmTestHash${i}`,
          { value: ethers.utils.parseEther('100') }
        );
      }

      const activeInvoices = await invoiceFactoring.getActiveInvoices();
      expect(activeInvoices.length).to.equal(3);
    });

    it('Should return user investments', async function () {
      // Create and invest in invoice
      await invoiceFactoring.connect(exporter).createInvoice(
        ethers.utils.parseEther('1000'),
        90,
        750,
        'QmTestHash123',
        { value: ethers.utils.parseEther('100') }
      );

      await invoiceFactoring.connect(investor).investInInvoice(1, {
        value: ethers.utils.parseEther('500'),
      });

      const userInvestments = await invoiceFactoring.getUserInvestments(investor.address);
      expect(userInvestments.length).to.equal(1);
      expect(userInvestments[0]).to.equal(1);
    });
  });
});