use anchor_lang::prelude::*;

declare_id!("FXD8xcRKWTPDxSomFA2tgXoyqSCeoXxSgkgzW4q1eLnB");

#[program]
pub mod orao_solana_vrf_callback {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
