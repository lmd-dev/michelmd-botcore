import { QuickDB } from 'quick.db';
import { Module, ModuleData } from '../modules/module';

/**
 * Class responsible for manage modules data in database
 */
class DAOModule
{
    //Link to the database
    private readonly _db : QuickDB;
    
    /**
     * Constructor
     */
    constructor()
    {
        this._db = new QuickDB({filePath: "dao/db.sqlite"})
    }

    /**
     * Saves settings of the given module
     * @param {Module} module 
     */
    async save(module: Module)
    {
        const modulesTable = this._db.table("module");

        await modulesTable.set(module.name, module.toData());
    }

    /**
     * Loads settings of the given module
     * @param {Module} module 
     */
    async load(module: Module)
    {
        const modulesTable = this._db.table("module");

        const data: ModuleData | null = await modulesTable.get(module.name);

        if(data)
            module.fromData(data);
    }
}

//DAO Module service
export const daoModule = new DAOModule();
